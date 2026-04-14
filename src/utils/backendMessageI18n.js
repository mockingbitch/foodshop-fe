import { translate } from '@utils/translate'

/**
 * Map backend messages (English) to i18n keys.
 * Backend is still the source of truth for status codes; this only improves UI toast text.
 */
const MESSAGE_TO_KEY = {
  // Generic
  'Created successfully': 'api.createdSuccessfully',
  'Created successfully.': 'api.createdSuccessfully',
  'Login successful': 'api.loginSuccessful',
  'Login successful!': 'api.loginSuccessful',
  'Admin login successful': 'api.adminLoginSuccessful',
  'Admin login successful!': 'api.adminLoginSuccessful',
  'Logout successful': 'api.logoutSuccessful',
  'Logout successful!': 'api.logoutSuccessful',
  'Profile updated successfully': 'api.profileUpdatedSuccessfully',
  'Profile updated successfully.': 'api.profileUpdatedSuccessfully',

  // Validation
  'The password field must be at least 8 characters.': 'errors.passwordMin8',

  // Auth / access
  'Resource not found': 'errors.notFound',
  'Resource not found.': 'errors.notFound',
  'Unauthorized': 'errors.unauthorized',
  'Unauthorized.': 'errors.unauthorized',
  'Forbidden': 'errors.forbidden',
  'Forbidden.': 'errors.forbidden',
  'The given data was invalid.': 'errors.validationError',
  'Unauthenticated.': 'errors.unauthorized',
  'Forbidden. Admin access required.': 'errors.adminAccessRequired',
  'Account is inactive.': 'errors.accountInactive',
  'Your account is inactive.': 'errors.accountInactive',
  'Your account is inactive. Please contact support.': 'errors.accountInactiveContactSupport',
  'Your email address is not verified.': 'errors.emailNotVerified',
  'The provided credentials are incorrect.': 'errors.invalidCredentials',

  // Owner / restaurant
  'Restaurant owner registered successfully': 'api.restaurantOwnerRegisteredSuccessfully',
  'Restaurant owner registered successfully.': 'api.restaurantOwnerRegisteredSuccessfully',
  'Restaurant created successfully.': 'api.restaurantCreatedSuccessfully',
  'Restaurant updated successfully': 'api.restaurantUpdatedSuccessfully',
  'Restaurant updated successfully.': 'api.restaurantUpdatedSuccessfully',
  'Restaurant deleted successfully': 'api.restaurantDeletedSuccessfully',
  'Restaurant deleted successfully.': 'api.restaurantDeletedSuccessfully',
  'Restaurant status updated successfully': 'api.restaurantStatusUpdatedSuccessfully',
  'Restaurant status updated successfully.': 'api.restaurantStatusUpdatedSuccessfully',

  // Food items
  'Food item created successfully.': 'api.foodItemCreatedSuccessfully',
  'Food item updated successfully': 'api.foodItemUpdatedSuccessfully',
  'Food item updated successfully.': 'api.foodItemUpdatedSuccessfully',
  'Food item deleted successfully': 'api.foodItemDeletedSuccessfully',
  'Food item deleted successfully.': 'api.foodItemDeletedSuccessfully',
  'Food code confirmed successfully': 'api.foodCodeConfirmedSuccessfully',
  'Food code confirmed successfully.': 'api.foodCodeConfirmedSuccessfully',
  'Food item status updated successfully': 'api.foodItemStatusUpdatedSuccessfully',
  'Food item status updated successfully.': 'api.foodItemStatusUpdatedSuccessfully',

  // Categories
  'Category created successfully': 'api.categoryCreatedSuccessfully',
  'Category created successfully.': 'api.categoryCreatedSuccessfully',
  'Category updated successfully': 'api.categoryUpdatedSuccessfully',
  'Category updated successfully.': 'api.categoryUpdatedSuccessfully',
  'Category deleted successfully': 'api.categoryDeletedSuccessfully',
  'Category deleted successfully.': 'api.categoryDeletedSuccessfully',
  'Translation added/updated successfully': 'api.translationUpsertedSuccessfully',
  'Translation added/updated successfully.': 'api.translationUpsertedSuccessfully',
  'Cannot delete category with subcategories.': 'errors.cannotDeleteCategoryWithSubcategories',
  'Cannot delete category with food items.': 'errors.cannotDeleteCategoryWithFoodItems',

  // Menus
  'Menu created successfully': 'api.menuCreatedSuccessfully',
  'Menu created successfully.': 'api.menuCreatedSuccessfully',
  'Menu updated successfully': 'api.menuUpdatedSuccessfully',
  'Menu updated successfully.': 'api.menuUpdatedSuccessfully',
  'Menu deleted successfully': 'api.menuDeletedSuccessfully',
  'Menu deleted successfully.': 'api.menuDeletedSuccessfully',

  // News
  'News created successfully': 'api.newsCreatedSuccessfully',
  'News created successfully.': 'api.newsCreatedSuccessfully',
  'News updated successfully': 'api.newsUpdatedSuccessfully',
  'News updated successfully.': 'api.newsUpdatedSuccessfully',
  'News deleted successfully': 'api.newsDeletedSuccessfully',
  'News deleted successfully.': 'api.newsDeletedSuccessfully',

  // Reviews
  'Review submitted successfully.': 'api.reviewSubmittedSuccessfully',
  'Review status updated successfully': 'api.reviewStatusUpdatedSuccessfully',
  'Review status updated successfully.': 'api.reviewStatusUpdatedSuccessfully',
  'Review deleted successfully': 'api.reviewDeletedSuccessfully',
  'Review deleted successfully.': 'api.reviewDeletedSuccessfully',

  // Upload / image processing
  'Image upload failed. Check CLOUDINARY_* or IMGUR_CLIENT_ID in .env.': 'errors.imageUploadFailed',
  'Invalid image dimensions.': 'errors.invalidImageDimensions',
  'Failed to create destination image.': 'errors.failedToCreateDestinationImage',
  'Failed to load image.': 'errors.failedToLoadImage',
  'Failed to encode JPEG.': 'errors.failedToEncodeJpeg',
}

export function translateBackendMessage(message) {
  if (message == null) return null
  const raw = String(message).trim()
  if (!raw) return null

  // If multiple lines, translate line-by-line then join.
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length > 1) {
    const out = lines.map((line) => translateBackendMessage(line) ?? line)
    const unique = [...new Set(out)]
    return unique.join('\n')
  }

  // Handle template messages with variables.
  // Example: "Unsupported image type: {mime}"
  if (raw.startsWith('Unsupported image type:')) {
    const rest = raw.replace(/^Unsupported image type:\s*/i, '').trim()
    const tpl = translate('errors.unsupportedImageType')
    return tpl.includes('{mime}') ? tpl.replace('{mime}', rest) : `${tpl} ${rest}`.trim()
  }

  const key = MESSAGE_TO_KEY[raw]
  return key ? translate(key) : null
}

