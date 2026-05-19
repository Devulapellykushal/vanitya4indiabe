import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class FetchExercisesDto extends PaginationDto {
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
