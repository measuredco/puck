export function calculateDistance(pointA, pointB) {
  // Destructure the coordinates from the points
  const { x: x1, y: y1 } = pointA;
  const { x: x2, y: y2 } = pointB;

  // Calculate the differences in x and y coordinates
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;

  // Calculate the distance using the Euclidean distance formula
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  return distance;
}
