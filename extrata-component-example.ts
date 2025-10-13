/**
 * CourseCard Component
 * 
 * Displays a course card with thumbnail, info, and action buttons.
 * Used in course listing pages.
 * 
 * @example
 * ```tsx
 * <CourseCard
 *   course={course}
 *   onEnroll={handleEnroll}
 *   className="custom-class"
 * />
 * ```
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Clock, 
  Users, 
  Star, 
  BookOpen,
  Play,
  CheckCircle2 
} from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  category: string;
  difficulty_level: 'iniciante' | 'intermediario' | 'avancado';
  estimated_hours: number;
  stats: {
    total_enrollments: number;
    avg_rating: number;
    completion_rate: number;
  };
}

export interface Enrollment {
  id: string;
  progress_percentage: number;
  completed_at?: string;
}

export interface CourseCardProps {
  course: Course;
  enrollment?: Enrollment;
  onEnroll?: (courseId: string) => void;
  onContinue?: (courseId: string) => void;
  className?: string;
  variant?: 'default' | 'compact';
}

// ============================================
// COMPONENT
// ============================================

export function CourseCard({
  course,
  enrollment,
  onEnroll,
  onContinue,
  className,
  variant = 'default',
}: CourseCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Derived state
  const isEnrolled = !!enrollment;
  const isCompleted = !!enrollment?.completed_at;
  const progress = enrollment?.progress_percentage || 0;

  // Handlers
  const handleAction = async () => {
    setIsLoading(true);
    try {
      if (isEnrolled && onContinue) {
        await onContinue(course.id);
      } else if (onEnroll) {
        await onEnroll(course.id);
      }
    } catch (error) {
      console.error('Error handling course action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helpers
  const getDifficultyColor = (level: string) => {
    const colors = {
      iniciante: 'bg-green-100 text-green-800',
      intermediario: 'bg-yellow-100 text-yellow-800',
      avancado: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || colors.iniciante;
  };

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`;
    }
    return `${hours}h`;
  };

  // Render compact variant
  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-lg transition-all', className)}>
        <Link href={`/courses/${course.slug}`}>
          <div className="flex gap-4 p-4">
            {/* Thumbnail */}
            <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
              <Image
                src={imageError ? '/images/placeholder-course.jpg' : course.thumbnail_url}
                alt={course.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate mb-1">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {course.description}
              </p>
              
              {isEnrolled && (
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="h-2" />
                  <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
              )}
            </div>

            {/* Action */}
            <div className="flex items-center">
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <Play className="w-6 h-6 text-primary" />
              )}
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  // Render default variant
  return (
    <Card className={cn(
      'group hover:shadow-xl transition-all duration-300 hover:-translate-y-1',
      className
    )}>
      {/* Thumbnail */}
      <CardHeader className="p-0">
        <Link href={`/courses/${course.slug}`}>
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={imageError ? '/images/placeholder-course.jpg' : course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              priority={false}
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-12 h-12 text-white" />
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className={getDifficultyColor(course.difficulty_level)}>
                {course.difficulty_level}
              </Badge>
              {isCompleted && (
                <Badge className="bg-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Concluído
                </Badge>
              )}
            </div>

            {/* Category */}
            <div className="absolute top-3 right-3">
              <Badge variant="secondary">
                {course.category}
              </Badge>
            </div>
          </div>
        </Link>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-6">
        <Link href={`/courses/${course.slug}`}>
          <h3 className="font-bold text-xl mb-2 line-clamp-2 hover:text-primary transition-colors">
            {course.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {course.description}
        </p>

        {/* Progress (if enrolled) */}
        {isEnrolled && !isCompleted && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progresso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {/* Duration */}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatHours(course.estimated_hours)}</span>
            </div>

            {/* Enrollments */}
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.stats.total_enrollments}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{course.stats.avg_rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Completion Rate */}
          {course.stats.completion_rate > 0 && (
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.stats.completion_rate}% concluem</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-6 pt-0">
        {isCompleted ? (
          <Button 
            variant="outline" 
            className="w-full"
            asChild
          >
            <Link href={`/courses/${course.slug}`}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Revisitar Curso
            </Link>
          </Button>
        ) : isEnrolled ? (
          <Button 
            className="w-full"
            onClick={handleAction}
            disabled={isLoading}
          >
            <Play className="w-4 h-4 mr-2" />
            {isLoading ? 'Carregando...' : 'Continuar'}
          </Button>
        ) : (
          <Button 
            className="w-full"
            onClick={handleAction}
            disabled={isLoading}
          >
            {isLoading ? 'Matriculando...' : 'Iniciar Curso'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ============================================
// SKELETON LOADING STATE
// ============================================

export function CourseCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <Card>
        <div className="flex gap-4 p-4">
          <div className="w-24 h-24 bg-gray-200 rounded-md animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-2 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="h-48 bg-gray-200 rounded-t-lg animate-pulse" />
      <CardContent className="p-6 space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="flex gap-4 mt-4">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
      </CardFooter>
    </Card>
  );
}

// ============================================
// EXPORTS
// ============================================

export default CourseCard;
