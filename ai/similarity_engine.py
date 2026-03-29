from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import nltk

nltk.download('punkt')

model = SentenceTransformer('all-MiniLM-L6-v2')

def find_similar_sentences(doc1, doc2, threshold=0.75):

    sentences1 = nltk.sent_tokenize(doc1)
    sentences2 = nltk.sent_tokenize(doc2)

    emb1 = model.encode(sentences1)
    emb2 = model.encode(sentences2)

    sim_matrix = cosine_similarity(emb1, emb2)

    matches = []

    for i in range(len(sentences1)):
        for j in range(len(sentences2)):

            score = sim_matrix[i][j]

            if score > threshold:
                matches.append({
                    "doc1_sentence": sentences1[i],
                    "doc2_sentence": sentences2[j],
                    "similarity": float(score)
                })

    return matches