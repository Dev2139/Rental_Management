import Supercluster from 'supercluster';

/**
 * Creates a supercluster index from property data
 */
export const createClusterIndex = (properties: any[]) => {
  const points = properties.map(property => ({
    type: 'Feature' as const,
    properties: {
      cluster: false,
      propertyData: property,
    },
    geometry: {
      type: 'Point' as const,
      coordinates: [Number(property.longitude), Number(property.latitude)],
    },
  }));

  const clusterIndex = new Supercluster({
    radius: 75, // Radius of each cluster in pixels
    maxZoom: 16, // Max zoom level where clusters will be generated
    minPoints: 2, // Minimum number of points to form a cluster
  });

  clusterIndex.load(points);

  return clusterIndex;
};

/**
 * Gets clustered features for given bounds and zoom level
 */
export const getClusters = (clusterIndex: Supercluster<any>, bbox: [number, number, number, number], zoom: number) => {
  return clusterIndex.getClusters(bbox, Math.floor(zoom));
};

/**
 * Gets children of a cluster (individual properties in the cluster)
 */
export const getClusterChildren = (clusterIndex: Supercluster<any>, clusterId: number) => {
  return clusterIndex.getLeaves(clusterId, Infinity);
};

/**
 * Checks if a feature is a cluster
 */
export const isCluster = (feature: any) => {
  return !!feature.properties.cluster;
};