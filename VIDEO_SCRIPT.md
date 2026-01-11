# ExplainX Video Walkthrough Script & Guide

**Time Limit:** 10 Minutes Hard Stop  
**Goal:** Demonstrate technical depth, clear communication, and the "why" behind your choices.

---

## 📅 Part 1: Introduction (0:00 - 1:00)
**Context:** Start with energy. Hook them immediately with the *problem* you solve.

**Speaker Notes:**
> "Hi, I'm [Your Name], and this is **ExplainX**.
> 
> We live in a world of 'Black Box' APIs. You send data to a backend, you get a result, but you have no idea *why* that result happened. Did the tax calculation fail? Was the user disqualified because of experience or salary?
> 
> ExplainX is an 'Execution Explainer SDK'. It hooks into your Python code using decorators, captures the runtime context of your functions, and uses an LLM to generate a human-readable narrative of exactly what happened inside the machine.
> 
> Let's look at how I built it."

---

## 🏗️ Part 2: Architecture (1:00 - 4:00)
**Context:** Don't read the code. Explain the *System Design*.

**Visuals:** Show a diagram if you have one, or split-screen with your `backend/main.py` and `backend/functions/resume.py`.

**Key Talking Points:**

1.  **The Decorator Pattern (`@explainX`)**:
    > "The core of the architecture is the `@explainX` decorator. I chose this because it's **non-intrusive**. Developers don't need to rewrite their logic; they just tag the functions they want to explain.
    > 
    > When a function runs, this decorator intercepts the call, captures the `inputs` (arguments) and `outputs` (return values), and pushes them onto a trace stack. It’s essentially a middleware for function execution."

2.  **Data Flow & State Management**:
    > "I'm using **FastAPI** for the backend. Because HTTP is stateless, I needed a way to persist traces during a request lifecycle. I implemented a global trace store that initializes at the start of a request (`clear_traces`) and pops the stack at the end (`pop_traces`)."

3.  **The "Sync/Async" Trade-off (Crucial technical detail)**:
    > "One major design decision was how to handle the LLM integration. Real-time explanation adds latency. 
    > I built the system to execute the core logic *first*, collect the raw traces, and *then* send them to DeepSeek for explanation. This ensures that even if the explanation fails or times out, the actual business logic (the `result`) is preserved and returned to the user."

---

## 🚀 Part 3: Live Demo (4:00 - 7:00)
**Context:** Show, don't just tell. Use the **Resume Selection** feature as it's the most complex.

**Action Plan:**
1.  **Open the Frontend**: distinct "Request" and "Response" panels.
2.  **Scenario**: "I'm a recruiter filtering 5000 candidates."
3.  **Action**:
    - Go to the **Resume Selection** form.
    - Set `Min Experience` to `5 Years`.
    - Upload the `candidates.json` file (or use Simulation mode).
    - detailed validation error handling if you want to show off the recent fix, but better to show the *success case* first.
4.  **The Reveal**:
    - Click **Submit**.
    - Watch the **Right Panel** populate.
    - **Highlight the Text**: "Look at this. Not only do we get the top 10 candidates, but ExplainX generates a narrative: *'First, 120 candidates were disqualified for low experience. Then, salary filters removed top-tier demands...'*."
5.  **The "Aha!" Moment**:
    - "This turns a raw JSON array into a story that a non-technical product manager can understand."

---

## 🧠 Part 4: Reflection & The "Struggle" (7:00 - 9:00)
**Context:** This is the most important part for hiring managers. They want to see how you solve problems.

**The Story: Granularity vs. Performance (The Batching Pivot)**

**Speaker Notes:**
> "I want to talk about a specific challenge I faced with the Resume Selection pipeline.
> 
> **The Problem:** 
> Initially, I wrote the code to process candidates one by one. I had loops like `for user in users: validate(user)`.
> 
> Functionally, it worked. But when I ran it with 5000 mock users, the system generated **5000 individual traces**. 
> 
> Sending 5000 tiny JSON objects to the LLM blew up the context window and made the explanation extremely verbose and repetitive. The LLM would just say 'Validated user 1, Validated user 2...' ad infinitum.
> 
> **The Solution:**
> I had to refactor the architecture from **Iterative Processing** to **Batch (Vector-style) Processing**.
> 
> I rewrote functions like `validate_user` to `validate_users` (plural), taking the entire list as input.
> 
> **The Result:** 
> Instead of 5000 traces, I now get **5 traces**: one for 'Validation', one for 'Experience Scoring', etc. 
> This reduced the token count by 99% and resulted in a much higher-quality, high-level summary from the AI. It taught me that when designing validatable systems, **granularity must be balanced with cognitive load**."

---

## 👋 Part 5: Conclusion (9:00 - 10:00)
**Context:** Wrap it up nicely.

**Speaker Notes:**
> "In conclusion, ExplainX bridges the gap between code and humans. It handled complex pipelines, integrates seamlessly with FastAPI, and uses GenAI to make debugging conversational.
> 
> Thank you for your time."

---

## 🎥 Tips for Recording
1.  **Clean Your Screen:** Close irrelevant tabs.
2.  **Zoom In:** Make sure your code is readable (Ctrl+).
3.  **Audio:** Check your mic before the full take.
4.  **Eye Contact:** Look at the camera when explaining the architecture/reflection, look at the screen during the demo.
