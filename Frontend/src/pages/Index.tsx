import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Shield, Home, ArrowRight, Star, Users, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PropertyCard from '@/components/properties/PropertyCard';
import { useProperties } from '@/hooks/useProperties';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [searchCity, setSearchCity] = useState('');
  const { data: properties } = useProperties();
  const navigate = useNavigate();
  const featuredProperties = properties?.slice(0, 3) || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/explore?city=${encodeURIComponent(searchCity)}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <Shield className="w-4 h-4" />
                Verified Listings Only
              </div>

              <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl leading-tight">
                Find Your
                <span className="text-gradient block">Perfect Home</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg">
                Discover verified rental properties from trusted landlords. 
                Browse by location, view on map, and secure your next home with confidence.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter city or location..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="pl-10 h-12 input-styled"
                  />
                </div>
                <Button type="submit" size="lg" className="btn-primary h-12 px-6">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </form>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                <div>
                  <p className="text-3xl font-display font-bold text-foreground">2,500+</p>
                  <p className="text-sm text-muted-foreground">Properties Listed</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-foreground">1,200+</p>
                  <p className="text-sm text-muted-foreground">Happy Tenants</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-foreground">98%</p>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
                <div className="relative bg-card rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                  <img
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
                    alt="Beautiful modern home"
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      San Francisco, CA
                    </div>
                    <h3 className="text-white font-display text-xl font-semibold">Modern Villa with Garden</h3>
                    <p className="text-primary font-bold text-2xl mt-2">$3,500/mo</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4">Why Choose HomeNest?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make finding your next rental home simple, safe, and stress-free.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Listings',
                description: 'All properties are verified by our team to ensure authenticity and quality.',
              },
              {
                icon: MapPin,
                title: 'Map Discovery',
                description: 'Explore properties on an interactive map to find the perfect location.',
              },
              {
                icon: CheckCircle,
                title: 'Secure Payments',
                description: 'Pay rent securely through our platform with complete transaction history.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 card-hover"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-4xl font-bold mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">Handpicked homes for you</p>
            </div>
            <Link to="/explore">
              <Button variant="outline" className="gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {featuredProperties.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl">
              <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No Properties Yet</h3>
              <p className="text-muted-foreground mb-6">Be the first to list your property!</p>
              <Link to="/auth?mode=signup">
                <Button className="btn-primary">List Your Property</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-primary-foreground">
              <h2 className="font-display text-4xl font-bold mb-4">
                Ready to Find Your Next Home?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8">
                Join thousands of happy tenants who found their perfect rental through HomeNest.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/explore">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Search className="w-5 h-5" />
                    Browse Properties
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    List Your Property
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-primary-foreground/10 backdrop-blur rounded-2xl p-6 text-primary-foreground">
                    <Users className="w-8 h-8 mb-3" />
                    <p className="text-2xl font-bold">500+</p>
                    <p className="text-sm opacity-80">Trusted Landlords</p>
                  </div>
                  <div className="bg-primary-foreground/10 backdrop-blur rounded-2xl p-6 text-primary-foreground">
                    <Star className="w-8 h-8 mb-3" />
                    <p className="text-2xl font-bold">4.9/5</p>
                    <p className="text-sm opacity-80">User Rating</p>
                  </div>
                </div>
                <div className="pt-8">
                  <div className="bg-primary-foreground/10 backdrop-blur rounded-2xl p-6 text-primary-foreground">
                    <Home className="w-8 h-8 mb-3" />
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-sm opacity-80">Support Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
