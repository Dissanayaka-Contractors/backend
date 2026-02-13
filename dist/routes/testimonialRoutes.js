"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testimonialController_1 = require("../controllers/testimonialController");
const router = (0, express_1.Router)();
router.get('/', testimonialController_1.getTestimonials);
exports.default = router;
