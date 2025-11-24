import { Request, Response, NextFunction } from "express";
import { DogApiService } from "../services/dogApiService";
import { asyncHandler } from "../middlewares/errorHandler";
import { AppError } from "../middlewares/errorHandler";

const dogApiService = new DogApiService();

export const getRandomDog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await dogApiService.getRandomDogImage();

    res.json({
      success: true,
      message: "Random dog image fetched successfully",
      data: result,
    });
  }
);

export const getRandomDogByBreed = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { breed } = req.params;

    if (!breed) {
      throw new AppError("Breed parameter is required", 400);
    }

    const result = await dogApiService.getRandomDogImageByBreed(breed);

    res.json({
      success: true,
      message: `Random ${breed} image fetched successfully`,
      data: result,
    });
  }
);

export const getAllBreeds = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await dogApiService.getAllBreeds();

    res.json({
      success: true,
      message: "Breeds list fetched successfully",
      data: result,
    });
  }
);
