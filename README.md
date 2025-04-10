# Udyog360

A modern web application built with Next.js for managing payments, subscriptions, and financial tracking. This platform provides a comprehensive solution for handling payments, generating invoices, and managing subscriptions.

## 🚀 Features

- **Authentication**: Secure user authentication using Clerk
- **Dashboard**: Overview of financial activities and key metrics
- **Payments**: Track and manage payment transactions
- **Invoices**: Generate and manage invoices
- **Subscriptions**: Handle recurring payments and subscription management
- **Reports**: Generate detailed financial reports
- **Retailer Management**: Manage retailer information and relationships
- **Activity Tracking**: Monitor all financial activities
- **Settings**: Customize user preferences and account settings

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: Clerk
- **Database**: Firebase
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **PDF Generation**: jsPDF
- **Type Safety**: TypeScript

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Clerk account

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd ptp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📦 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## 📁 Project Structure

```
ptp/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Dashboard pages
│   ├── invoices/          # Invoice management
│   ├── payments/          # Payment processing
│   ├── reports/           # Financial reports
│   ├── retailers/         # Retailer management
│   ├── settings/          # User settings
│   └── subscription/      # Subscription management
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── public/                # Static assets
└── types/                 # TypeScript type definitions
```

## 🔒 Security

- All sensitive data is encrypted
- Authentication is handled through Clerk
- API routes are protected
- Environment variables are used for sensitive information

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.
