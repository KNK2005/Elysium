from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from pymongo import MongoClient

# MongoDB Configuration
MONGO_URI = "mongodb+srv://sanidhyakumdev:2wPOZg1aNmk7JfV0@elysium.97nbum7.mongodb.net/?retryWrites=true&w=majority&appName=Elysium"
DATABASE_NAME = "test"  # Replace with your database name
USERS_COLLECTION_NAME = "users"  # Replace with your users collection name


def get_database():
    """Connects to the MongoDB database and returns the database object."""
    try:
        client = MongoClient(MONGO_URI)  # Establish connection
        return client.get_database(DATABASE_NAME)  # Use the specified database
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None


def find_user_by_name(db, user_name):
    """
    Retrieves user data from the database based on user_name.

    Args:
        db: The MongoDB database object.
        user_name: The name of the user to find.

    Returns:
        A dictionary containing the user data, or None if the user is not found.
    """
    try:
        users_collection = db.get_collection(USERS_COLLECTION_NAME)  # Use the specified collection
        user = users_collection.find_one({"name": user_name})  # Find the user based on name
        return user
    except Exception as e:
        print(f"Error finding user: {e}")
        return None

#  API Key Setup
GOOGLE_API_KEY = "AIzaSyDa3YvTacxDxSxzwUgV9jYAOALBjnfPYN0"
if not GOOGLE_API_KEY:
    print("Error: GOOGLE_API_KEY environment variable not set.  Please set it.")
    exit()

genai.configure(api_key=GOOGLE_API_KEY)

# Select the Gemini model
def get_available_model():
    """
    Lists available models and returns the name of the first model that supports generateContent
    AND is not deprecated (if the deprecation attribute exists).
    Returns None if no such model is found.
    """
    suitable_models = []
    for model in genai.list_models():
        if (
            "generateContent" in model.supported_generation_methods
            and (not hasattr(model, 'deprecation') or model.deprecation.is_deprecated is False)  # Check if deprecated, if attribute exists
        ):
            suitable_models.append(model)

    # Prioritize non-vision models
    non_vision_models = [
        model for model in suitable_models if "vision" not in model.name.lower()
    ]
    if non_vision_models:
        print(f"Found suitable model(s) without 'vision': {[m.name for m in non_vision_models]}")
        return non_vision_models[0].name  # Return the *first* non-vision model

    # If no non-vision models are found, return the first available model (even if it's a vision model)
    if suitable_models:
        print(f"Found suitable model(s) *with* 'vision' (using as fallback): {[m.name for m in suitable_models]}")
        return suitable_models[0].name  # Return the *first* suitable model, even vision

    return None  # No suitable models found

model_name = get_available_model()

if not model_name:
    print(
        "Error: No suitable model supporting 'generateContent' found.  Check your API key, region, and library version."
    )
    print(
        "This could also indicate that all available models are deprecated.  Contact Google AI support."
    )
    exit()

model = genai.GenerativeModel(model_name)  # Use the dynamically found model

def get_response(prompt, context=None):
    """Generates a response from the Gemini model."""
    try:
        if context:
            full_prompt = f"{context}\n\nUser: {prompt}"
        else:
            full_prompt = prompt

        response = model.generate_content(full_prompt)
        return response.text

    except Exception as e:
        print(f"Error during Gemini API call: {e}")
        return f"An error occurred while processing your request. Please try again later. Error: {e}"


app = Flask(__name__)
CORS(app)

# Get the database object when your chatbot starts
db = get_database()

# Check if database connected
if db is None:
    print("Failed to connect to the database.  Chatbot will not function.")
    exit()

@app.route('/chat', methods=['POST'])
def chat():
    """Handles incoming chat requests."""
    data = request.get_json()
    user_message = data.get('message')
    user_name = data.get('name')  # Get the user's name from the request

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    user_data = None
    if user_name:
        user_data = find_user_by_name(db, user_name)

    #Build the context
    context = """
You are a helpful and informative chatbot designed to provide support and resources for people facing various challenges, including rare diseases, rehabilitation, and addiction.  You aim to connect people who may find it difficult to relate to others' experiences. You should always act with empathy.

When providing information or resources, please use bullet points to format your responses for better readability. Keep each point concise and focused.
Keep sentences brief and clear. Limit to 10-20 words.
VERY IMPORTANT GIVE SHORT AND VERY CRISP RESPONSES DONT USE '*' ANYWHERE YOUR POINTS WILL BE DEDUCTED
Use everyday words that are easy to understand.
– Pick common words over complex ones. Use technical terms only when needed.
– Avoid words with 4+ syllables. If you must use them, keep surrounding text simple.
– Write for a 8th grade reading level.
– Skip overused business terms and jargon like: delve, digital age, cutting-edge, leverage, proactive, pivotal, seamless, fast-paced, game-changer, quest, realm, landscape, evolve, resilient, thrill, unravel, embark, world.
– Make direct statements without hedging.
– Connect ideas naturally without forced transitions.
– Use standard punctuation.
– Vary sentence structure and punctuation naturally.
– Never use: indeed, furthermore, thus, moreover, notwithstanding, ostensibly, consequently, specifically, notably, alternatively.

"""
    #Personalize the Context
    if user_data:
      context += f"You are interacting with {user_data['name']}.  {user_data['background']}. They are a {user_data['sex']} who currently is a {user_data['occupation']} as a {user_data['job']}. "
      if user_data['disease']:
          context += f"They have {user_data['disease']}. "
      if user_data['addiction']:
          context += f"They are facing {user_data['addiction']} challenges."
    else:
       context += f"You do not have a profile of this user."

    context += """
You are a helpful and informative chatbot designed to provide support and resources for people facing various challenges, including rare diseases, rehabilitation, and addiction. You aim to connect people who may find it difficult to relate to others' experiences. You should always act with empathy.

When providing information or resources, please use bullet points to format your responses for better readability. Keep each point concise and focused.

- Keep sentences brief and clear. Limit to 30 words MAXIUM NEGATIVE POINTS WILL BE GIVEN.
- Use everyday words that are easy to understand.
- Pick common words over complex ones. Use technical terms only when needed.
- Avoid words with 4+ syllables. If you must use them, keep surrounding text simple.
- Write for an 8th-grade reading level.
- Skip overused business terms and jargon.
- Make direct statements without hedging.
- Connect ideas naturally without forced transitions.
- Use standard punctuation.
- Vary sentence structure and punctuation naturally.
- DO NOT REPEAT YOURSELF AND KEEP THE CONVERSATION FLOWING.
- Never use: indeed, furthermore, thus, moreover, notwithstanding, ostensibly, consequently, specifically, notably, alternatively.
- Avoid using the word "I" or "we" in your responses. Focus on the user's needs and experiences.



**Guidelines:**
- Prioritize evidence-based resources. Focus on organizations and treatments that have been shown to be effective.
- You are not a medical professional or therapist. Do not provide medical advice, diagnoses, or treatment recommendations. Always advise users to consult with qualified healthcare providers or addiction specialists.

Once you've given the crisis resources, listen attentively to the mood and tone of the conversation. Provide thoughtful responses and support based on their needs.
If someone is feeling down suggest them to talk to others on the elysium forum to talk to like minded individuals while also ensuring that if they are still uncomfortable to talk to people they can still confide with the bot

"""
    response = get_response(user_message, context)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True, port=5003)

