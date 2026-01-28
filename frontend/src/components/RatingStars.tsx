import { useState } from 'react';

interface RatingStarsProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const RatingStars = ({
    rating,
    onRatingChange,
    readonly = false,
    size = 'md',
}: RatingStarsProps) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    const handleClick = (value: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };

    /*
     * Calcula el porcentaje de llenado de una estrella específica.
     * Para estrellas completas retorna 100%, para la parcial el porcentaje exacto.
     */
    const getStarFillPercentage = (starPosition: number): number => {
        const currentRating = hoverRating || rating;
        
        if (currentRating >= starPosition) {
            return 100;
        } else if (currentRating > starPosition - 1) {
            return (currentRating - (starPosition - 1)) * 100;
        }
        return 0;
    };

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const fillPercentage = getStarFillPercentage(star);

                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => !readonly && setHoverRating(star)}
                        onMouseLeave={() => !readonly && setHoverRating(0)}
                        disabled={readonly}
                        className={`${sizeClasses[size]} ${readonly ? 'cursor-default' : 'cursor-pointer'
                            } relative inline-block transition-all duration-200`}
                        style={{ flexShrink: 0 }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="w-full h-full"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <defs>
                                <linearGradient id={`star-gradient-${star}-${fillPercentage}`}>
                                    <stop offset={`${fillPercentage}%`} stopColor="#D4AF37" />
                                    <stop offset={`${fillPercentage}%`} stopColor="#374151" stopOpacity="0.3" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                fill={`url(#star-gradient-${star}-${fillPercentage})`}
                                stroke="#D4AF37"
                                strokeWidth="0.5"
                            />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
};

export default RatingStars;
