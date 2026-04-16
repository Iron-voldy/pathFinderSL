const pathfinderPool = require('../../config/pathfinderDb');

async function createDestination({ name, district, category, description }) {
  const [result] = await pathfinderPool.execute(
    'INSERT INTO DESTINATION (name, district, category, description) VALUES (?, ?, ?, ?)',
    [name, district || null, category || null, description || null]
  );
  return { id: result.insertId, name, district, category, description };
}

async function getAllDestinations() {
  const [rows] = await pathfinderPool.execute(
    `SELECT 
       d.destination_id AS id, 
       d.name, 
       d.district, 
       d.category, 
       d.description, 
       d.average_rating AS averageRating,
       GROUP_CONCAT(di.image_url) AS imageUrls
     FROM DESTINATION d
     LEFT JOIN DESTINATION_IMAGE di ON d.destination_id = di.destination_id
     GROUP BY d.destination_id
     ORDER BY d.destination_id DESC`
  );
  return rows;
}

async function addDestinationImage(destinationId, imageUrl) {
  const [result] = await pathfinderPool.execute(
    'INSERT INTO DESTINATION_IMAGE (destination_id, image_url) VALUES (?, ?)',
    [destinationId, imageUrl]
  );
  return { id: result.insertId, destinationId, imageUrl };
}

async function deleteDestination(id) {
  const [result] = await pathfinderPool.execute('DELETE FROM DESTINATION WHERE destination_id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  createDestination,
  getAllDestinations,
  addDestinationImage,
  deleteDestination,
};
