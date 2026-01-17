import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, X, Home } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PropertyCard from '@/components/properties/PropertyCard';
import { useProperties } from '@/hooks/useProperties';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

const propertyTypes = [
  { value: 'all', label: 'All Types' },
  { value: '1bhk', label: '1 BHK' },
  { value: '2bhk', label: '2 BHK' },
  { value: '3bhk', label: '3 BHK' },
  { value: 'studio', label: 'Studio' },
  { value: 'pg', label: 'PG' },
  { value: 'villa', label: 'Villa' },
  { value: 'apartment', label: 'Apartment' },
];

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    minRent: '',
    maxRent: '',
    propertyType: 'all',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    city: searchParams.get('city') || undefined,
    minRent: undefined as number | undefined,
    maxRent: undefined as number | undefined,
    propertyType: undefined as string | undefined,
  });

  const { data: properties, isLoading } = useProperties(appliedFilters);

  useEffect(() => {
    const city = searchParams.get('city');
    if (city) {
      setFilters(prev => ({ ...prev, city }));
      setAppliedFilters(prev => ({ ...prev, city }));
    }
  }, [searchParams]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      city: filters.city || undefined,
      minRent: filters.minRent ? Number(filters.minRent) : undefined,
      maxRent: filters.maxRent ? Number(filters.maxRent) : undefined,
      propertyType: filters.propertyType === 'all' ? undefined : filters.propertyType,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      city: '',
      minRent: '',
      maxRent: '',
      propertyType: 'all',
    });
    setAppliedFilters({
      city: undefined,
      minRent: undefined,
      maxRent: undefined,
      propertyType: undefined,
    });
    setSearchParams({});
  };

  const hasActiveFilters = appliedFilters.city || appliedFilters.minRent || appliedFilters.maxRent || appliedFilters.propertyType;

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="City or area..."
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="pl-9 input-styled"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Min Rent</Label>
          <Input
            type="number"
            placeholder="$0"
            value={filters.minRent}
            onChange={(e) => setFilters({ ...filters, minRent: e.target.value })}
            className="input-styled"
          />
        </div>
        <div className="space-y-2">
          <Label>Max Rent</Label>
          <Input
            type="number"
            placeholder="$10,000"
            value={filters.maxRent}
            onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
            className="input-styled"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Property Type</Label>
        <Select
          value={filters.propertyType}
          onValueChange={(value) => setFilters({ ...filters, propertyType: value })}
        >
          <SelectTrigger className="input-styled">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={handleClearFilters}>
          Clear
        </Button>
        <Button className="flex-1 btn-primary" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Explore Properties</h1>
            <p className="text-muted-foreground">
              {properties?.length || 0} properties available
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Search */}
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search location..."
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                  className="pl-9 w-64 input-styled"
                />
              </div>
              <Select
                value={filters.propertyType}
                onValueChange={(value) => {
                  setFilters({ ...filters, propertyType: value });
                  setAppliedFilters({
                    ...appliedFilters,
                    propertyType: value === 'all' ? undefined : value,
                  });
                }}
              >
                <SelectTrigger className="w-40 input-styled">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleApplyFilters} className="btn-primary">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
                <SheetHeader className="mb-6">
                  <SheetTitle className="font-display">Filter Properties</SheetTitle>
                </SheetHeader>
                <FilterContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {appliedFilters.city && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                <MapPin className="w-3 h-3" />
                {appliedFilters.city}
                <button onClick={() => setAppliedFilters({ ...appliedFilters, city: undefined })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {appliedFilters.propertyType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {appliedFilters.propertyType.toUpperCase()}
                <button onClick={() => setAppliedFilters({ ...appliedFilters, propertyType: undefined })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/50">
                <Skeleton className="h-56 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : properties && properties.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No Properties Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search for a different location.
            </p>
            <Button onClick={handleClearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Explore;
