import type { Waitress } from '../types';
import RatingStars from './RatingStars';

interface WaitressCardProps {
    waitress: Waitress;
    onClick?: () => void;
}

const WaitressCard = ({ waitress, onClick }: WaitressCardProps) => {
    const initials = waitress.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div
            onClick={onClick}
            className="luxury-card-hover p-6 cursor-pointer group relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="relative">
                    {waitress.photoUrl ? (
                        <img
                            src={waitress.photoUrl}
                            alt={waitress.name}
                            className="w-24 h-24 rounded-full object-cover border-2 border-night-600 group-hover:border-gold-400/50 transition-all duration-400 shadow-luxury"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center text-night-900 text-2xl font-bold border-2 border-night-600 group-hover:border-gold-400/50 transition-all duration-400 shadow-luxury font-display">
                            {initials}
                        </div>
                    )}

                    {waitress.active && (
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-neon-red rounded-full border-2 border-night-800 glow-neon"></div>
                    )}
                </div>

                <h3 className="text-lg font-display font-semibold text-gray-100 group-hover:text-gold-400 transition-colors duration-300">
                    {waitress.name}
                </h3>

                <div className="space-y-2">
                    <RatingStars
                        rating={waitress.averageRating || 0}
                        readonly
                        size="sm"
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-semibold text-gold-400">
                            {waitress.averageRating?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-night-500">•</span>
                        <span>{waitress.reviewCount || 0} reseñas</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitressCard;
