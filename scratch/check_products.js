import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function checkProducts() {
  try {
    const response = await axios.get(`${API_URL}/products`);
    console.log('Total Products:', response.data.length);
    const carbonGrip = response.data.find((p: any) => p.name.includes('Carbon Grip'));
    if (carbonGrip) {
      console.log('Carbon Grip X1 Image Data:');
      console.log('imageUrl:', carbonGrip.imageUrl);
      console.log('images:', carbonGrip.images);
    } else {
      console.log('Carbon Grip X1 not found.');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

checkProducts();
