import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Property } from '@/hooks/useProperties';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import FavoriteButton from '@/components/ui/favorite-button';
import { usePropertyStatusContext } from '@/contexts/PropertyStatusContext';

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

const PropertyCard = ({ property, compact = false }: PropertyCardProps) => {
  const [imageError, setImageError] = useState(false);
  const { getStatus } = usePropertyStatusContext();
  const status = getStatus(property.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatPropertyType = (type: string) => {
    const types: Record<string, string> = {
      '1bhk': '1 BHK',
      '2bhk': '2 BHK',
      '3bhk': '3 BHK',
      'studio': 'Studio',
      'pg': 'PG',
      'villa': 'Villa',
      'apartment': 'Apartment',
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: 'Available', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
      rented: { label: 'Rented', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
      under_maintenance: { label: 'Maintenance', className: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
  };

  const defaultImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop';
  const imageUrl = property.images && property.images.length > 0 && !imageError
    ? property.images[0]
    : defaultImage;

  if (compact) {
    return (
      <Link to={`/property/${property.id}`}>
        <div className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 flex">
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
          <div className="p-3 flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{property.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{property.address}</p>
            <p className="text-primary font-bold text-sm mt-1">{formatPrice(property.rent)}/mo</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-card card-hover group"
    >
      <Link to={`/property/${property.id}`}>
        <div className="relative h-56 overflow-hidden">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
          
          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge className="bg-card/90 backdrop-blur text-foreground border-0">
              {formatPropertyType(property.property_type)}
            </Badge>
            {property.is_verified && (
              <Badge className="badge-verified">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            <Badge className={getStatusBadge(status).className}>
              {getStatusBadge(status).label}
            </Badge>
          </div>

          {/* Favorite button */}
          <FavoriteButton
            propertyId={property.id}
            size="sm"
            className="absolute top-3 right-3"
          />

          {/* Price tag */}
          <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur px-3 py-1.5 rounded-lg">
            <span className="text-primary font-bold text-lg">{formatPrice(property.rent)}</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-display font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{property.address}, {property.city}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} Baths</span>
            </div>
            {property.area_sqft && (
              <div className="flex items-center gap-1.5">
                <Square className="w-4 h-4" />
                <span>{property.area_sqft} sqft</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
