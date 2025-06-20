# Building Planner

A comprehensive web application for creating, editing, and managing building plans with advanced drawing tools, annotations, and MongoDB storage.

- Live URL:


## Features

### Drawing Tools

- **Select Tool**: Move and delete shapes with visual handles
- **Line Tool**: Draw straight lines with precise measurements
- **Rectangle Tool**: Create rectangles with width/height dimensions
- **Circle Tool**: Draw circles with radius calculations
- **Triangle Tool**: Create triangular shapes for architectural elements
- **Arrow Tool**: Draw directional arrows with proper arrowheads
- **Text Tool**: Add text annotations directly on the canvas

## Technology Stack

- **Frontend**: Next.js with TypeScript
- **Database**: MongoDB
- **Canvas**: HTML5 Canvas
- **Styling**: Tailwind CSS

## 📦 Installation

1. **Clone the repository:**

```
git clone https://github.com/RutikKulkarni/Building-Planner.git
cd Building-Planner
```

2. **Install dependencies:**

```
npm install
```

3. **Set up environment variables:**

```
MONGODB_URI=mongodb://localhost:27017/Building-Planner
```

4. **Start the development server:**

```
npm run dev
```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Schema

```{
  _id: ObjectId,
  name: String,
  shapes: [
    {
      id: String,
      type: String,
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      strokeColor: String,
      strokeWidth: Number,
      fillColor: String,
      text: String // for text shapes
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```
