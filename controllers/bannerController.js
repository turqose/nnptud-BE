const Banner = require("../models/banner");
const { deleteFile } = require("../utils/fileUpload");

// Validate banner data
const validateBannerData = (data) => {
  const { title } = data;
  if (!title) {
    throw new Error("Missing required field: title");
  }
};

// Get all banners with pagination
exports.getAllBanner = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const banners = await Banner.findAndCountAll({
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });
    res.status(200).json({
      total: banners.count,
      pages: Math.ceil(banners.count / limit),
      data: banners.rows,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    res.status(200).json(banner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    validateBannerData(req.body);
    const { title, status } = req.body;
    let image = req.file;
    if (!image) {
      return res.status(400).json({ error: "Missing required field: image" });
    }

    const banner = await Banner.create({
      title,
      image: image.path,
      status,
    });
    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    validateBannerData(req.body);
    const { title } = req.body;
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    banner.title = title;
    if (req.file) {
      banner.image = req.file.path;
    }

    await banner.save();
    res.status(200).json(banner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }
    deleteFile(banner.image);
    await banner.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
