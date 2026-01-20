import axios from '@services/axios'

export const uploadApi = {
  uploadImages: (files) => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file)
    })
    
    return axios.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  uploadRestaurantImages: (outsideImages, insideImages) => {
    const formData = new FormData()
    
    outsideImages.forEach((file, index) => {
      formData.append(`outside_images[${index}]`, file)
    })
    
    insideImages.forEach((file, index) => {
      formData.append(`inside_images[${index}]`, file)
    })
    
    return axios.post('/upload/restaurant-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  uploadFoodImages: (mainImage, extraImages = []) => {
    const formData = new FormData()
    
    if (mainImage) {
      formData.append('main_image', mainImage)
    }
    
    extraImages.forEach((file, index) => {
      formData.append(`extra_images[${index}]`, file)
    })
    
    return axios.post('/upload/food-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
