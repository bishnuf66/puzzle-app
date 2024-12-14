
  const images = [
    '/bottle.jpg',
    'car.jpg',
    'food.jpg',
    'forest_house.jpg',
    'goat.jpg',
    'puppy.jpg',
    'tree.jpg',
    'buld.jpg',
    'orangutan.jpg',
    'sunflower.jpg',
  ];
  
  // Function to return a random image URL
  export const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };

  // export const randomImageUrl = getRandomImage(); 
  
   

