import { v4 as uuidv4 } from 'uuid';

export function generateShortRoomId() {
  const uuid = uuidv4().replace(/-/g, ''); // Remove dashes
  const shortId = parseInt(uuid.slice(0, 12), 16).toString(36); // Hex to base36
  return shortId; // Example: "3g8v9k1l4d"
}
