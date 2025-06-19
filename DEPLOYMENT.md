# TaskFlow Frontend Deployment Guide

## Vercel Deployment

### Environment Variables Required

Make sure to set the following environment variable in your Vercel project settings:

```
VITE_API_URL=https://your-api-server.com
```

Replace `https://your-api-server.com` with your actual backend API URL.

### Build Settings

- **Framework Preset**: Vite
- **Node.js Version**: 18.x or higher
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Build Configuration

The project uses:
- **TypeScript**: ESNext module resolution for compatibility
- **Vite**: Modern build tool with fast builds
- **React**: Latest version with modern hooks

### Troubleshooting

1. **Module Resolution Errors**: Fixed by updating `tsconfig.json` to use `"moduleResolution": "bundler"`
2. **Environment Variables**: Ensure `VITE_API_URL` is set in Vercel environment variables
3. **Build Failures**: Check that all import paths use relative imports without file extensions

### Features

- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **TaskFlow Branding**: Professional UI with consistent branding
- ✅ **Smart Tagging**: Color-coded task organization
- ✅ **Modern UI**: Gradient designs and smooth animations
- ✅ **Type Safety**: Full TypeScript support

### API Integration

The frontend expects the backend API to be running and accessible at the URL specified in `VITE_API_URL`. Make sure your backend supports:

- User authentication (signup/signin)
- Task CRUD operations
- Tag management
- CORS configuration for your frontend domain
