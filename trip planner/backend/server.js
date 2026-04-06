import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/generate-trip", async (req, res) => {
  const { destination, days, travelers, budget, interests } = req.body;

  if (!destination || !days || !budget || !interests || interests.length === 0) {
    return res.status(400).json({
      success: false,
      error: "All fields are required"
    });
  }

  try {
    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content: `
You are an AI trip planner.

Return ONLY valid JSON.
Do not add markdown.
Do not add explanation outside JSON.

Return in this exact format:
{
  "summary": "short summary of the trip",
  "totalEstimatedCost": "approx total cost",
  "days": [
    {
      "day": 1,
      "title": "Short title for the day",
      "places": ["Place 1", "Place 2"],
      "food": ["Food 1", "Food 2"],
      "transport": "transport suggestion",
      "estimatedCost": "approx cost for this day",
      "tips": "short useful tip"
    }
  ]
}
`
          },
          {
            role: "user",
            content: `Create a detailed ${days}-day trip plan for ${destination} for ${travelers} traveler(s) with a budget of ₹${budget}. Interests: ${interests.join(", ")}.`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5500",
          "X-OpenRouter-Title": "AI Trip Planner"
        }
      }
    );

    const rawContent = aiResponse.data.choices[0].message.content;

    let parsedPlan;
    try {
      parsedPlan = JSON.parse(rawContent);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        error: "AI returned invalid format. Please try again."
      });
    }

    return res.json({
      success: true,
      plan: parsedPlan
    });
  } catch (error) {
    console.log("FULL ERROR:");
    console.log(error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || "Failed to generate trip"
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});