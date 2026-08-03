// CRUD for property listings. Create/update/delete are landlord-only,
// AND restricted to listings the requesting landlord actually owns —
// roleCheck.js only confirms "you're a landlord," this file confirms
// "you're the landlord who owns THIS listing."

import { prisma } from '../config/prismaClient.js';

export const createListing = async (req, res) => {
  try {
    const { title, description, price, location, school, amenities, photos } = req.body;

    if (!title || !description || !price || !location || !school) {
      return res.status(400).json({
        success: false,
        message: 'title, description, price, location, and school are required',
      });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price,
        location,
        school,
        amenities: amenities || [],
        photos: photos || [],
        landlordId: req.user.id,
      },
    });

    res.status(201).json({ success: true, message: 'Listing created', listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getListings = async (req, res) => {
  try {
    const { school, minPrice, maxPrice, location, amenities } = req.query;

    const where = {};

    if (school) {
      where.school = school;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (amenities) {
      const amenitiesList = amenities.split(',').map((a) => a.trim());
      where.amenities = { hasEvery: amenitiesList };
    }

    const listings = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, count: listings.length, listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id: Number(id) },
      include: { landlord: { select: { id: true, name: true, email: true, verified: true } } },
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.listing.findUnique({ where: { id: Number(id) } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (existing.landlordId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own listings',
      });
    }

    const { title, description, price, location, school, amenities, photos } = req.body;

    const updated = await prisma.listing.update({
      where: { id: Number(id) },
      data: { title, description, price, location, school, amenities, photos },
    });

    res.status(200).json({ success: true, message: 'Listing updated', listing: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.listing.findUnique({ where: { id: Number(id) } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (existing.landlordId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own listings',
      });
    }

    await prisma.listing.delete({ where: { id: Number(id) } });

    res.status(200).json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Uploads one or more photos to Cloudinary and attaches their URLs
// to an existing listing. Landlord-only, and only for their own listing.
export const uploadListingPhotos = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.listing.findUnique({ where: { id: Number(id) } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (existing.landlordId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload photos to your own listings',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const newPhotoUrls = req.files.map((file) => file.path);

    const updated = await prisma.listing.update({
      where: { id: Number(id) },
      data: { photos: [...existing.photos, ...newPhotoUrls] },
    });

    res.status(200).json({ success: true, message: 'Photos uploaded', listing: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};