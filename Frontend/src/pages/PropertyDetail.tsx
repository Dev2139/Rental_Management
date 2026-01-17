import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Shield,
  Calendar,
  Heart,
  Share2,
  Check,
  MessageSquare,
  CreditCard,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useProperty } from '@/hooks/useProperties';
import { useCreateRentalRequest } from '@/hooks/useRentalRequests';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, isLoading } = useProperty(id || '');
  const { user, role } = useAuth();
  const createRequest = useCreateRentalRequest();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [isRequestOpen, setIsRequestOpen] = useState(false);

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

  const handleSendRequest = async () => {
    if (!user) {
      toast.error('Please sign in to send a rental request');
      navigate('/auth?mode=login');
      return;
    }

    if (role !== 'tenant') {
      toast.error('Only tenants can send rental requests');
      return;
    }

    if (!property) return;

    await createRequest.mutateAsync({
      propertyId: property.id,
      ownerId: property.owner_id,
      message: requestMessage,
      moveInDate: moveInDate || undefined,
    });

    setIsRequestOpen(false);
    setRequestMessage('');
    setMoveInDate('');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-2xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Property Not Found</h1>
          <p className="text-muted-foreground mb-8">The property you're looking for doesn't exist.</p>
          <Link to="/explore">
            <Button>Browse Properties</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="relative h-96 rounded-2xl overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-card/90 backdrop-blur text-foreground border-0">
                    {formatPropertyType(property.property_type)}
                  </Badge>
                  {property.is_verified && (
                    <Badge className="badge-verified">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="w-10 h-10 rounded-full bg-card/90 backdrop-blur flex items-center justify-center"
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-card/90 backdrop-blur flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Property Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="font-display text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{property.address}, {property.city}{property.state ? `, ${property.state}` : ''}</span>
              </div>

              <div className="flex flex-wrap gap-6 py-4 border-y border-border">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-primary" />
                  <span className="font-medium">{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-primary" />
                  <span className="font-medium">{property.bathrooms} Bathrooms</span>
                </div>
                {property.area_sqft && (
                  <div className="flex items-center gap-2">
                    <Square className="w-5 h-5 text-primary" />
                    <span className="font-medium">{property.area_sqft} sqft</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-display text-xl font-semibold mb-4">About this property</h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description || 'No description provided for this property.'}
              </p>
            </motion.div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="font-display text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Rules */}
            {property.rules && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="font-display text-xl font-semibold mb-4">House Rules</h2>
                <p className="text-muted-foreground">{property.rules}</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display font-bold text-primary">
                      {formatPrice(property.rent)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Deposit: {formatPrice(property.deposit)}
                  </p>
                </div>

                <div className="space-y-4 mb-6 py-4 border-y border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Property Type</span>
                    <span className="font-medium">{formatPropertyType(property.property_type)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={property.is_available ? 'badge-approved' : 'badge-rejected'}>
                      {property.is_available ? 'Available' : 'Not Available'}
                    </Badge>
                  </div>
                </div>

                {role === 'tenant' || !user ? (
                  <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full btn-primary h-12 text-base gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Send Rental Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-display">Send Rental Request</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Preferred Move-in Date</Label>
                          <Input
                            type="date"
                            value={moveInDate}
                            onChange={(e) => setMoveInDate(e.target.value)}
                            className="input-styled"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Message to Owner (Optional)</Label>
                          <Textarea
                            placeholder="Introduce yourself and explain why you're interested in this property..."
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                        </div>
                        <Button
                          className="w-full btn-primary"
                          onClick={handleSendRequest}
                          disabled={createRequest.isPending}
                        >
                          {createRequest.isPending ? 'Sending...' : 'Send Request'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <p className="text-center text-muted-foreground text-sm">
                    Only tenants can send rental requests
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetail;
