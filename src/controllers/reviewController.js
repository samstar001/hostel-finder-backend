// Students leave one review per listing (enforced by a database
// unique constraint). Anyone can read a listing's reviews — no
// auth required for browsing.

import { prisma } from '../config/prismaClient.js';

// Student submits a review on a listing. One review per student
// per listing — a second attempt is caught below and returns a
// clean error instead of a raw database exception.
export const createReview = async (req, res) => {
  try {
    const { id } = req.params; // listing id
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'rating is required and must be between 1 and 5',
      });
    }

    const listing = await prisma.listing.findFirst({
      where: { id: Number(id), isDeleted: false },
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const review = await prisma.review.create({
      data: {
        listingId: Number(id),
        studentId: req.user.id,
        rating,
        comment,
      },
    });

    res.status(201).json({ success: true, message: 'Review submitted', review });
  } catch (err) {
    // Prisma's error code for "unique constraint violated"
    if (err.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this listing',
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public — anyone can see a listing's reviews, plus the average rating.
export const getListingReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await prisma.review.findMany({
      where: { listingId: Number(id) },
      include: { student: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating,
      reviews,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};