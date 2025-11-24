import axios, { AxiosError } from "axios";
import { AppError } from "../middlewares/errorHandler";

const DOG_API_BASE_URL = "https://dog.ceo/api";
const REQUEST_TIMEOUT = 5000; // 5 seconds

export class DogApiService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: DOG_API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor - log outgoing requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(
          `External API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - log responses
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(
          `External API Response: ${response.status} ${response.config.url}`
        );
        return response;
      },
      (error) => {
        console.error(`External API Error: ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  // Get random dog image
  async getRandomDogImage() {
    try {
      const response = await this.axiosInstance.get("/breeds/image/random");

      // Validate response structure
      if (!response.data || response.data.status !== "success") {
        throw new AppError("Invalid response from Dog API", 502);
      }

      const imageUrl = response.data.message;

      // Extract breed from URL
      // Example: https://images.dog.ceo/breeds/waterdog-spanish/20181023_072736.jpg
      const breed = this.extractBreedFromUrl(imageUrl);

      return {
        imageUrl,
        breed,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  // Get random dog image by breed
  async getRandomDogImageByBreed(breed: string) {
    try {
      const response = await this.axiosInstance.get(
        `/breed/${breed}/images/random`
      );

      if (!response.data || response.data.status !== "success") {
        throw new AppError("Invalid response from Dog API", 502);
      }

      const imageUrl = response.data.message;

      return {
        imageUrl,
        breed,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  // Get all breeds list
  async getAllBreeds() {
    try {
      const response = await this.axiosInstance.get("/breeds/list/all");

      if (!response.data || response.data.status !== "success") {
        throw new AppError("Invalid response from Dog API", 502);
      }

      const breeds = Object.keys(response.data.message);

      return {
        breeds,
        total: breeds.length,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  // Helper: Extract breed from image URL
  private extractBreedFromUrl(url: string): string {
    try {
      const parts = url.split("/");
      const breedIndex = parts.indexOf("breeds") + 1;
      return parts[breedIndex] || "unknown";
    } catch {
      return "unknown";
    }
  }

  // Helper: Handle API errors
  private handleApiError(error: any): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.code === "ECONNABORTED") {
        throw new AppError("External API request timeout", 504);
      }

      if (axiosError.response) {
        // API responded with error status
        const status = axiosError.response.status;
        if (status === 404) {
          throw new AppError("Resource not found in external API", 404);
        }
        throw new AppError(`External API error: ${status}`, 502);
      }

      if (axiosError.request) {
        // Request made but no response
        throw new AppError("External API is unavailable", 503);
      }
    }

    // Unknown error
    throw new AppError("Failed to fetch from external API", 500);
  }
}
