import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../exercise/entities/exercise.entity';
import { AiService } from '../ai/ai.service';
import * as fs from 'fs';

@Injectable()
export class SttService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private aiService: AiService
  ) {}

  async processAudio(
    file: Express.Multer.File,
    language: string,
    exerciseId?: string
  ) {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    try {
      // Call AI service for speech-to-text
      const sttResult = await this.aiService.speechToText({
        audioFile: file,
        language
      });

      // Clean up uploaded file
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file:', cleanupError);
      }

      const response: any = {
        text: sttResult.text,
        confidence: sttResult.confidence,
        language,
        processingTime: sttResult.processing_time_ms || sttResult.processingTime
      };

      // If exerciseId is provided, check if the transcribed text matches the expected answer
      if (exerciseId) {
        const exercise = await this.exerciseRepository.findOne({
          where: { id: exerciseId }
        });

        if (exercise) {
          const isMatch =
            sttResult.text.toLowerCase().trim() ===
            exercise.correctAnswer.toLowerCase().trim();
          response.matchesExpected = isMatch;
          response.expectedAnswer = exercise.correctAnswer;
        }
      }

      return response;
    } catch (error) {
      // Clean up uploaded file on error
      try {
        if (file?.path) {
          fs.unlinkSync(file.path);
        }
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file:', cleanupError);
      }

      console.error('STT processing error:', error);
      throw new InternalServerErrorException({
        message: 'Failed to process audio',
        details: error.message
      });
    }
  }

  getSupportedLanguages() {
    return {
      languages: [
        { code: 'hi', name: 'Hindi' },
        { code: 'te', name: 'Telugu' },
        { code: 'ta', name: 'Tamil' },
        { code: 'bn', name: 'Bengali' },
        { code: 'gu', name: 'Gujarati' },
        { code: 'kn', name: 'Kannada' },
        { code: 'ml', name: 'Malayalam' },
        { code: 'mr', name: 'Marathi' },
        { code: 'or', name: 'Odia' },
        { code: 'pa', name: 'Punjabi' },
        { code: 'ur', name: 'Urdu' },
        { code: 'en', name: 'English' }
      ]
    };
  }
}
