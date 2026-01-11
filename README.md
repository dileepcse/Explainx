# ExplainX 🧠

**ExplainX** is an AI-powered API execution explainer that automatically traces function calls and generates human-readable explanations using LLMs. Perfect for understanding complex API workflows, debugging, and documentation.

## 🌟 Features

- **Automatic Function Tracing**: Captures inputs, outputs, execution time, and source code
- **AI-Powered Explanations**: Uses DeepSeek and OpenRouter APIs to generate clear explanations
- **Multiple Demo APIs**: 
  - Simple & Full Checkout flows
  - Resume selection pipeline
  - Reference data endpoints
- **Interactive UI**: Beautiful web interface to test APIs and view traces
- **Swagger Documentation**: Auto-generated API docs at `/docs`
- **Real-time Execution Reports**: Download detailed execution traces as `explainX.txt`

## 📁 Project Structure

```
second/
├── backend/              # FastAPI backend server
│   ├── main.py          # Main API endpoints
│   ├── explainx.py      # Core tracing decorator
│   ├── llm.py           # LLM integration (DeepSeek, OpenRouter)
│   ├── apis/            # API implementations
│   │   └── checkout.py  # Checkout logic
│   ├── functions/       # Business logic functions
│   │   ├── inventory.py
│   │   ├── pricing.py
│   │   ├── resume.py
│   │   ├── tax.py
│   │   └── validation.py
│   └── requirements.txt # Python dependencies
│
├── frontend_legacy/     # Vanilla HTML/CSS/JS frontend
│   ├── index.html       # Main UI
│   ├── styles.css       # Styling
│   └── app.js           # Frontend logic
│
├── Frontend-main/       # Next.js frontend (alternative)
│   └── ...              # Next.js app structure
│
└── candidates.json      # Sample data for resume selection
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 16+** (optional, for Next.js frontend)
- **API Keys** (optional but recommended):
  - DeepSeek API key (get from [deepseek.com](https://platform.deepseek.com))
  - OpenRouter API key (get from [openrouter.ai](https://openrouter.ai))

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables** (optional)
   
   Create a `.env` file in the `backend` directory:
   ```env
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
   
   > **Note**: If you don't provide API keys, the system will use fallback explanations (still functional but less detailed).

4. **Run the backend server**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   
   Or simply:
   ```bash
   python main.py
   ```

   The backend will be available at: **http://localhost:8000**

5. **Access Swagger Documentation**
   
   Open your browser and go to: **http://localhost:8000/docs**

### Frontend Setup (Legacy - Recommended for Quick Start)

1. **Navigate to frontend_legacy directory**
   ```bash
   cd frontend_legacy
   ```

2. **Open in browser**
   
   Simply open `index.html` in your web browser, or use a local server:
   
   ```bash
   # Using Python
   python -m http.server 3000
   
   # Using Node.js
   npx serve -p 3000
   ```

3. **Access the UI**
   
   Open your browser and go to: **http://localhost:3000**

### Frontend Setup (Next.js - Alternative)

1. **Navigate to Frontend-main directory**
   ```bash
   cd Frontend-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Access the UI**
   
   Open your browser and go to: **http://localhost:3000**

## 🎯 Usage

### Using the Web Interface

1. **Start both backend and frontend** (see setup instructions above)

2. **Select an API endpoint** from the sidebar:
   - `/checkout/simple` - Basic checkout with discounts and tax
   - `/checkout/full` - Complete e-commerce checkout
   - `/resume/select` - Resume selection pipeline
   - Reference endpoints for test data

3. **Fill in the request parameters** in the form

4. **Click "Execute"** to run the API

5. **View the results** in three tabs:
   - **Result**: API response data
   - **Traces**: Detailed function execution traces
   - **ExplainX**: AI-generated explanations

6. **Download the report** using the "Download explainX.txt" button

### Using the API Directly

#### Example: Simple Checkout

```bash
curl -X POST "http://localhost:8000/checkout/simple" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 100,
    "user_type": "premium"
  }'
```

#### Example: Full Checkout

```bash
curl -X POST "http://localhost:8000/checkout/full" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "LAPTOP-001",
    "quantity": 2,
    "user_type": "premium",
    "state": "CA",
    "promo_code": "SAVE10",
    "express_shipping": false
  }'
```

#### Example: Resume Selection

```bash
curl -X POST "http://localhost:8000/resume/select" \
  -F "domain=backend" \
  -F "min_experience=2" \
  -F "salary_budget=100000" \
  -F "file=@candidates.json"
```

### Response Format

All ExplainX endpoints return:

```json
{
  "result": {
    // Your API response data
  },
  "traces": [
    {
      "function": "function_name",
      "file": "path/to/file.py",
      "inputs": { "param": "value" },
      "output": "result",
      "duration_ms": 1.23,
      "explanation": "AI-generated explanation..."
    }
  ],
  "explain_text": "Formatted execution report..."
}
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/llm.py` to configure LLM providers:

```python
# DeepSeek API
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")

# OpenRouter API
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
```

### Frontend Configuration

Edit `frontend_legacy/app.js` to change the API base URL:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## 📚 API Endpoints

### Checkout APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/checkout/simple` | POST | Basic checkout with user validation, discounts, and tax |
| `/checkout/full` | POST | Complete checkout with inventory, shipping, and promo codes |

### Resume APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/resume/select` | POST | Process candidate applications and select top candidates |

### Reference APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/products` | GET | List all available products |
| `/promo-codes` | GET | List all promo codes |
| `/user-types` | GET | List user types and discounts |
| `/states` | GET | List states with tax rates |

### System APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/docs` | GET | Swagger UI documentation |
| `/redoc` | GET | ReDoc documentation |

## 🧪 Testing

### Test Data

The application includes sample data for testing:

- **Products**: 5 products in inventory (laptops, phones, tablets, etc.)
- **Promo Codes**: SAVE10, SAVE20, FLAT50, FREESHIP
- **User Types**: premium (20% off), standard (10% off), guest (0% off)
- **States**: CA, NY, TX, FL, WA, OR with different tax rates
- **Candidates**: 25,032 sample candidates in `candidates.json`

### Example Test Scenarios

1. **Premium User Checkout**
   - User: premium
   - Price: $100
   - Expected: 20% discount applied

2. **Full Checkout with Promo**
   - Product: LAPTOP-001
   - Quantity: 2
   - Promo: SAVE10
   - Expected: Tier discount + promo discount + tax

3. **Resume Selection**
   - Domain: backend
   - Min Experience: 2 years
   - Salary Budget: $100,000
   - Expected: Top 10 candidates matching criteria

## 🛠️ Development

### Adding a New Traced Function

1. Import the decorator:
   ```python
   from explainx import explainX
   ```

2. Decorate your function:
   ```python
   @explainX()
   def my_function(param1, param2):
       # Your logic here
       return result
   ```

3. The function will automatically be traced!

### Creating a New API Endpoint

1. Add your endpoint in `backend/main.py`:
   ```python
   @app.post("/my-endpoint", response_model=ExplainXResponse)
   async def my_endpoint(payload: MyRequest):
       clear_traces()
       result = my_function(payload.data)
       traces = pop_traces()
       explained_traces = await explain_traces(traces)
       explain_text = build_explain_file(explained_traces)
       
       return ExplainXResponse(
           result=result,
           traces=explained_traces,
           explain_text=explain_text
       )
   ```

## 🐛 Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'fastapi'`
- **Solution**: Run `pip install -r requirements.txt`

**Issue**: `Address already in use`
- **Solution**: Change the port: `uvicorn main:app --port 8001`

**Issue**: LLM explanations not working
- **Solution**: Check your API keys in `.env` or `llm.py`. The app will work with fallback explanations if no keys are provided.

### Frontend Issues

**Issue**: CORS errors
- **Solution**: Make sure the backend is running and CORS is enabled (it's enabled by default)

**Issue**: Cannot connect to backend
- **Solution**: Verify the backend is running at `http://localhost:8000` and update `API_BASE_URL` in `app.js` if needed

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using FastAPI, Python, and AI**
