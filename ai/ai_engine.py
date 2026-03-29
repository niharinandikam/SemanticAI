import google.generativeai as genai


class AIAnalyzer:

    def __init__(self, api_key):

        genai.configure(api_key=api_key)

        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def generate_explanation(self, doc1, doc2, prediction):

        prompt = f"""

Two documents were compared for plagiarism.

Document 1:
{doc1}

Document 2:
{doc2}

Machine Learning plagiarism prediction score: {prediction}

Provide:

1. Semantic Explanation
Explain why these documents are similar or different.

2. Document Similarity Insights
Mention topic overlap and possible paraphrasing.

Return clearly structured explanation.
"""

        response = self.model.generate_content(prompt)

        return response.text