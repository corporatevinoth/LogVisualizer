# LogFlow Analytics 🚀

![LogFlow Analytics Screenshot](/screenshot.png)

**LogFlow Analytics** is a professional, browser-based visualization tool for microservice logs. It transforms raw text or JSON logs into interactive flow diagrams, helping developers spot latency bottlenecks, PII leaks, and service errors instantly.

Built with a **Cyberpunk / Deep Dark** aesthetic, it runs entirely client-side for maximum security.

## ✨ Features

- **Universal Log Parsing**: Paste JSON arrays, Spring Boot logs, or raw text. The engine uses heuristics to auto-detect service names and interactions.
- **Interactive Flowchart**: visualized using **React Flow**. Click nodes to highlight connections and dim noise.
- **Health Indicators**:
  - 🔴 **Critical**: Services with `ERROR` logs pulse red.
  - 🟡 **Slow**: Services with response times > 2000ms show an amber clock icon.
- **PII Detection**: Automatically scans for and counts sensitive data (Emails, Credit Cards).
- **Analytics Dashboard**: Bar charts for error frequency and a list of the slowest individual requests.

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Slate-950 Dark Theme)
- **Visualization**: React Flow (Nodes/Edges), Recharts (Analytics)
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Local Development

1. **Clone the repository** (or download source):
   ```bash
   git clone https://github.com/yourusername/logflow-analytics.git
   cd logflow-analytics
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:5173`

## 📦 Deployment

Since LogFlow Analytics is a **static web application**, it can be deployed anywhere that enables static site hosting (GitHub Pages, Netlify, Vercel, AWS S3, etc.).

### Build for Production

Run the build command to generate the static files:

```bash
npm run build
```

This will create a `dist/` directory containing the optimized `index.html`, CSS, and JS files.

### Deploying to Netlify (Drag & Drop)

1. Run `npm run build`.
2. Go to [Netlify Drop](https://app.netlify.com/drop).
3. Drag and drop the `dist` folder into the upload area.
4. Your site is live!

### Deploying to GitHub Pages

1. Update `vite.config.ts` to set the base path to your repository name:
   ```ts
   export default defineConfig({
     base: '/logflow-analytics/', // Replace with your repo name
     plugins: [react()],
   })
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Commit the `dist` folder or use a deploying action (like `gh-pages`):
   ```bash
   npx gh-pages -d dist
   ```

## 🧪 Sample Data

You can click the **"Load Sample"** button in the UI to see the tool in action, or paste the following text:

```text
2023-11-20 10:00:01 INFO [GatewayService] : Incoming request from user
2023-11-20 10:00:02 INFO [GatewayService] : Calling [AuthService] for token verification
2023-11-20 10:00:03 ERROR [AuthService] : Database connection failed duration=2500ms
2023-11-20 10:00:04 INFO [GatewayService] : Calling [OrderService] with token
2023-11-20 10:00:06 INFO [OrderService] : Request to [PaymentService] initiate charge
2023-11-20 10:00:08 INFO [PaymentService] : Charge successful took 450ms
```

## 📄 License

MIT
