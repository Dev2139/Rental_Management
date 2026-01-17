import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, Home, Search } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PropertyCard from '@/components/properties/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const WishlistPage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage (demo implementation)
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // In a real implementation, this would fetch from the database
        // const { data, error } = await supabase
        //   .from('favorites')
        //   .select('*, properties(*)')
        //   .eq('user_id', user.id)
        //   .order('created_at', { ascending: false });

        // For demo purposes, we'll use localStorage
        const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        // Mock property data for demonstration
        const mockProperties = favoriteIds.map((id: string, index: number) => ({
          id,
          title: `Favorite Property ${index + 1}`,
          description: 'Beautiful property with great amenities',
          property_type: '2bhk',
          rent: 2500 + (index * 500),
          deposit: 5000 + (index * 1000),
          address: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          latitude: 19.0760,
          longitude: 72.8777,
          bedrooms: 2,
          bathrooms: 2,
          area_sqft: 1200 + (index * 200),
          amenities: ['Wi-Fi', 'Parking', 'Gym'],
          rules: 'No pets allowed',
          images: [`https://images.unsplash.com/photo-${index + 1}?w=800&h=600&fit=crop`],
          is_available: true,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        setFavorites(mockProperties);
      } catch (error) {
        toast.error('Failed to load favorites');
        console.error('Error loading favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      // In a real implementation, this would delete from the database
      // await supabase.from('favorites').delete().eq('property_id', propertyId);
      
      // For demo purposes, update localStorage
      const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
      const newFavorites = favoriteIds.filter((id: string) => id !== propertyId);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      
      setFavorites(prev => prev.filter(prop => prop.id !== propertyId));
      toast.success('Removed from favorites!');
    } catch (error) {
      toast.error('Failed to remove favorite');
      console.error('Error removing favorite:', error);
    }
  };

  const filteredFavorites = favorites.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-4">Sign in to view your wishlist</h1>
          <p className="text-muted-foreground mb-8">
            Save your favorite properties to easily find them later.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              {filteredFavorites.length} favorite {filteredFavorites.length === 1 ? 'property' : 'properties'}
            </p>
          </div>
          
          {favorites.length > 0 && (
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/50">
                <div className="h-56 bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredFavorites.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredFavorites.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <PropertyCard property={property} />
                
                {/* Remove button overlay */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-4 right-14 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={() => handleRemoveFavorite(property.id)}
                  aria-label="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        ) : searchTerm ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No matching properties</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms.
            </p>
            <Button onClick={() => setSearchTerm('')} variant="outline">
              Clear search
            </Button>
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Start saving properties you love to your wishlist.
            </p>
            <Button onClick={() => window.location.href = '/explore'}>
              <Home className="w-4 h-4 mr-2" />
              Browse Properties
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WishlistPage;