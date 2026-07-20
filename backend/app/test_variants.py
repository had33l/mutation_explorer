import httpx
import json

# List of variants to test
variants = [
    "TP53 R175H", "HBB c.20A>T", "BRCA1 c.5266dupC", "BRAF V600E",
    "EGFR L858R", "CHEK2 c.1100delC", "MLH1 c.676C>T", "TP53 c.637C>T",
    "BRAF c.1799T>A", "EGFR c.2369C>T"
]

def test_variants():
    # Set a long timeout for LLM processing
    timeout = httpx.Timeout(120.0, connect=10.0)
    
    with httpx.Client(timeout=timeout) as client:
        for variant in variants:
            print(f"\n{'='*20}")
            print(f"Testing: {variant}")
            print(f"{'='*20}")
            
            try:
                # Encode variant name for URL
                encoded_variant = variant.replace(" ", "%20").replace(">", "%3E")
                url = f"http://localhost:8000/variant/{encoded_variant}"
                
                response = client.get(url)
                
                if response.status_code == 200:
                    # Print formatted JSON result
                    data = response.json()
                    print(json.dumps(data, indent=2))
                else:
                    print(f"❌ Error {response.status_code}: {response.text}")
                    
            except Exception as e:
                print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_variants()