import { Router } from "express";
import {
  getRandomDog,
  getRandomDogByBreed,
  getAllBreeds,
} from "../controllers/dogApiController";

const router = Router();

/**
 * @swagger
 * /api/dogs/random:
 *   get:
 *     summary: Get random dog image
 *     tags: [Dogs]
 *     security: []
 *     responses:
 *       200:
 *         description: Random dog image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                     breed:
 *                       type: string
 *                     fetchedAt:
 *                       type: string
 */
router.get("/random", getRandomDog);

/**
 * @swagger
 * /api/dogs/breeds:
 *   get:
 *     summary: Get all dog breeds
 *     tags: [Dogs]
 *     security: []
 *     responses:
 *       200:
 *         description: List of all breeds
 */
router.get("/breeds", getAllBreeds);

/**
 * @swagger
 * /api/dogs/breed/{breed}/random:
 *   get:
 *     summary: Get random dog image by breed
 *     tags: [Dogs]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: breed
 *         required: true
 *         schema:
 *           type: string
 *         example: husky
 *     responses:
 *       200:
 *         description: Random dog image of specified breed
 *       404:
 *         description: Breed not found
 */
router.get("/breed/:breed/random", getRandomDogByBreed);

export default router;
