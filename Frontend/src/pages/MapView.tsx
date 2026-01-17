import { useState, useCallback, useMemo, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, ViewStateChangeEvent } from 'react-map-gl';
import { MapPin, X, ExternalLink, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PropertyCard from '@/components/properties/PropertyCard';
import { useProperties, Property } from '@/hooks/useProperties';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { createClusterIndex, getClusters, getClusterChildren, isCluster } from '@/utils/mapClustering';
import 'mapbox-gl/dist/mapbox-gl.css';

// Demo Mapbox token - replace with your own for production
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const MapView = () => {
  const { data: properties, isLoading } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [clusterIndex, setClusterIndex] = useState<any>(null);
  const [clusters, setClusters] = useState<any[]>([]);
  const [viewState, setViewState] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 11,
  });

  // Initialize clustering when properties load
  useEffect(() => {
    if (properties && properties.length > 0) {
      const index = createClusterIndex(properties);
      setClusterIndex(index);
    }
  }, [properties]);

  // Update clusters when view state changes
  useEffect(() => {
    if (clusterIndex && properties && properties.length > 0) {
      const bounds = [
        viewState.longitude - 360 / Math.pow(2, viewState.zoom), // west
        viewState.latitude - 180 / Math.pow(2, viewState.zoom),     // south
        viewState.longitude + 360 / Math.pow(2, viewState.zoom), // east
        viewState.latitude + 180 / Math.pow(2, viewState.zoom)      // north
      ];
      
      const newClusters = getClusters(clusterIndex, bounds as [number, number, number, number], viewState.zoom);
      setClusters(newClusters);
    }
  }, [clusterIndex, properties, viewState]);

  // Calculate bounds based on properties
  const bounds = useMemo(() => {
    if (!properties || properties.length === 0) return null;

    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    properties.forEach((p) => {
      const lat = Number(p.latitude);
      const lng = Number(p.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      }
    });

    if (minLat === Infinity) return null;

    return {
      centerLat: (minLat + maxLat) / 2,
      centerLng: (minLng + maxLng) / 2,
    };
  }, [properties]);

  // Update view when properties load
  const handleLoad = useCallback(() => {
    if (bounds) {
      setViewState({
        latitude: bounds.centerLat,
        longitude: bounds.centerLng,
        zoom: 11,
      });
    }
  }, [bounds]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Layout showFooter={false}>
      <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row">
        {/* Sidebar - Property List */}
        <div className="w-full md:w-96 h-64 md:h-full bg-card border-b md:border-r border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-semibold text-lg">
              {properties?.length || 0} Properties on Map
            </h2>
            <p className="text-sm text-muted-foreground">Click markers to view details</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))
            ) : properties && properties.length > 0 ? (
              properties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => {
                    setSelectedProperty(property);
                    setViewState({
                      ...viewState,
                      latitude: Number(property.latitude),
                      longitude: Number(property.longitude),
                      zoom: 14,
                    });
                  }}
                  className={`cursor-pointer transition-all ${
                    selectedProperty?.id === property.id ? 'ring-2 ring-primary rounded-xl' : ''
                  }`}
                >
                  <PropertyCard property={property} compact />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No properties available</p>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            onZoom={(evt) => setViewState(evt.viewState)}
            onLoad={handleLoad}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
          >
            <NavigationControl position="top-right" />

            {/* Render clusters and individual markers */}
            {clusters.map((cluster) => {
              const [longitude, latitude] = cluster.geometry.coordinates;
              const isACluster = isCluster(cluster);
              
              if (isACluster) {
                // This is a cluster
                const { cluster_id, point_count } = cluster.properties;
                
                return (
                  <Marker
                    key={`cluster-${cluster_id}`}
                    latitude={latitude}
                    longitude={longitude}
                    anchor="center"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      
                      // Get cluster children to calculate zoom level
                      if (clusterIndex) {
                        const expansionZoom = Math.min(
                          clusterIndex.getClusterExpansionZoom(cluster_id),
                          20
                        );
                        
                        setViewState({
                          ...viewState,
                          latitude,
                          longitude,
                          zoom: expansionZoom,
                        });
                      }
                    }}
                  >
                    <div className="cursor-pointer transform transition-all hover:scale-110">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-lg border-2 border-white">
                        {point_count}
                      </div>
                    </div>
                  </Marker>
                );
              } else {
                // This is an individual property
                const property = cluster.properties.propertyData;
                
                return (
                  <Marker
                    key={property.id}
                    latitude={latitude}
                    longitude={longitude}
                    anchor="bottom"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setSelectedProperty(property);
                    }}
                  >
                    <div
                      className={`
                        cursor-pointer transition-all transform
                        ${selectedProperty?.id === property.id ? 'scale-125 z-10' : 'hover:scale-110'}
                      `}
                    >
                      <div
                        className={`
                          px-3 py-1.5 rounded-full font-semibold text-sm shadow-lg
                          ${selectedProperty?.id === property.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-foreground border border-border'
                          }
                        `}
                      >
                        {formatPrice(property.rent)}
                      </div>
                      <div
                        className={`
                          w-3 h-3 rotate-45 mx-auto -mt-1.5 
                          ${selectedProperty?.id === property.id
                            ? 'bg-primary'
                            : 'bg-card border-l border-b border-border'
                          }
                        `}
                      />
                    </div>
                  </Marker>
                );
              }
            })}

            {selectedProperty && (
              <Popup
                latitude={Number(selectedProperty.latitude)}
                longitude={Number(selectedProperty.longitude)}
                anchor="bottom"
                offset={25}
                onClose={() => setSelectedProperty(null)}
                closeButton={false}
                className="property-popup"
              >
                <div className="bg-card rounded-xl overflow-hidden w-72 shadow-xl border border-border">
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="absolute top-2 right-2 z-10 w-6 h-6 bg-card/90 backdrop-blur rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {selectedProperty.images && selectedProperty.images[0] && (
                    <img
                      src={selectedProperty.images[0]}
                      alt={selectedProperty.title}
                      className="w-full h-36 object-cover"
                    />
                  )}

                  <div className="p-4">
                    <h3 className="font-display font-semibold text-base mb-1 line-clamp-1">
                      {selectedProperty.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {selectedProperty.address}, {selectedProperty.city}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold text-lg">
                        {formatPrice(selectedProperty.rent)}/mo
                      </span>
                      <Link to={`/property/${selectedProperty.id}`}>
                        <Button size="sm" className="btn-primary gap-1">
                          View
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            )}
          </Map>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur rounded-xl p-3 shadow-lg border border-border">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary" />
                <span>Selected Property</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-white">
                  2+
                </div>
                <span>Property Cluster</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MapView;
