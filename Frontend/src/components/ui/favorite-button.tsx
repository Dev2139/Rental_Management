import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  propertyId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
}

const FavoriteButton = ({ 
  propertyId, 
  size = 'md', 
  className = '',
  onToggle 
}: FavoriteButtonProps) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Size mapping
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  // In a real implementation, this would use the useIsFavorite hook
  // For now, we'll simulate the functionality
  useEffect(() => {
    // Simulate checking favorite status
    const checkFavoriteStatus = async () => {
      if (!user || !propertyId) return;
      
      try {
        // This would be replaced with actual API call
        // const { data } = await supabase
        //   .from('favorites')
        //   .select('id')
        //   .eq('user_id', user.id)
        //   .eq('property_id', propertyId)
        //   .maybeSingle();
        // setIsFavorite(!!data);
        
        // For demo purposes, we'll use localStorage
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(propertyId));
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [user, propertyId]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    
    try {
      // This would be replaced with actual API call
      // const { data: existing } = await supabase
      //   .from('favorites')
      //   .select('id')
      //   .eq('user_id', user.id)
      //   .eq('property_id', propertyId)
      //   .maybeSingle();

      // For demo purposes, we'll use localStorage
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isCurrentlyFavorite = favorites.includes(propertyId);

      if (isCurrentlyFavorite) {
        // Remove from favorites
        const newFavorites = favorites.filter((id: string) => id !== propertyId);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        setIsFavorite(false);
        toast.success('Removed from favorites!');
      } else {
        // Add to favorites
        favorites.push(propertyId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        setIsFavorite(true);
        toast.success('Added to favorites!');
      }

      onToggle?.(!isCurrentlyFavorite);
    } catch (error) {
      toast.error('Failed to update favorites');
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`${sizeClasses[size]} rounded-full bg-card/90 backdrop-blur hover:bg-card transition-colors ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        handleToggleFavorite();
      }}
      disabled={isLoading}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`transition-all duration-200 ${
          isFavorite 
            ? 'fill-red-500 text-red-500 scale-110' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        size={iconSizes[size]}
      />
    </Button>
  );
};

export default FavoriteButton;