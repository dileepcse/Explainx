
import json
import random
from typing import List, Dict, Any
from explainx import explainX

# Mock data generators
NAMES = ["John", "Jane", "Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"]
DOMAINS = ["backend", "frontend", "fullstack", "data_science", "devops", "mobile"]
UNIVERSITIES = ["MIT", "Stanford", "Harvard", "Delhi University", "IIT", "BITS", "Other"]

def generate_applications(count: int) -> List[Dict[str, Any]]:
    """Generates a list of mock job applications."""
    apps = []
    for i in range(count):
        apps.append({
            "id": f"APP-{i+1:04d}",
            "name": f"{random.choice(NAMES)} {i}",
            "email": f"user{i}@example.com",
            "verified": random.random() > 0.05, # 95% verified
            "experience_years": round(random.uniform(0, 15), 1),
            "domain": random.choice(DOMAINS),
            "current_salary": round(random.uniform(30000, 150000), -2),
            "expected_salary": round(random.uniform(40000, 200000), -2),
            "cgpa": round(random.uniform(7.0, 10.0), 2)
        })
    return apps

def parse_candidate_file(content: str) -> List[Dict[str, Any]]:
    """
    Parses uploaded file content (JSON or Text) into a list of standardized candidate objects.
    
    Expected keys in input:
    - name
    - gmail / email
    - role / domain
    - domain experience / experience_years
    - current salary / current_salary
    - expected salary / expected_salary
    - cgpa
    """
    candidates = []
    
    try:
        # Try JSON first
        raw_data = json.loads(content)
        if isinstance(raw_data, dict):
            # Maybe it's wrapped in a key like "users" or "candidates"
            for key, val in raw_data.items():
                if isinstance(val, list):
                    raw_data = val
                    break
        
        if not isinstance(raw_data, list):
            # strict fallback
            raw_data = [raw_data] if isinstance(raw_data, dict) else []

    except json.JSONDecodeError:
        # Fallback: line-based JSON objects or simple text parsing could go here
        # For now, let's assume if it's not valid whole-file JSON, it might be JSON-lines
        raw_data = []
        for line in content.splitlines():
            line = line.strip()
            if not line: continue
            try:
                raw_data.append(json.loads(line))
            except:
                pass

    # Normalize data
    for item in raw_data:
        # Skip empty items or strings
        if not isinstance(item, dict): continue
        
        # Map fields to our internal schema
        normalized = {
            "id": item.get("id", f"UPLOAD-{random.randint(1000,9999)}"),
            "name": item.get("name", "Unknown Candidate"),
            "email": item.get("email") or item.get("gmail") or "no-email@example.com",
            # Default verified to True for uploads unless specified
            "verified": item.get("verified", True),
            
            # Map experience
            "experience_years": float(item.get("experience_years") or item.get("domain experience") or 0),
            
            # Map domain/role
            "domain": (item.get("domain") or item.get("role") or "unknown").lower().replace(" ", "_"),
            
            # Map Salaries
            "current_salary": float(item.get("current_salary") or item.get("current salary") or 0),
            "expected_salary": float(item.get("expected_salary") or item.get("expected salary") or 0),
            
            # CGPA
            "cgpa": float(item.get("cgpa") or 0.0)
        }
        candidates.append(normalized)
        
    return candidates

@explainX()
def validate_users(apps: List[Dict[str, Any]]) -> List[bool]:
    """Checks if users are valid, verified applicants."""
    results = []
    for app in apps:
        is_valid = True
        if not app.get("verified"):
            is_valid = False
        elif not app.get("email") or "@" not in app["email"]:
            is_valid = False
        results.append(is_valid)
    return results

@explainX()
def calculate_experience_scores(apps: List[Dict[str, Any]], min_exp: float) -> List[float]:
    """Scores based on experience years for all applicants."""
    scores = []
    for app in apps:
        exp = app["experience_years"]
        if exp < min_exp:
            scores.append(-100.0) # Disqualify if below min
        else:
            # Bonus for extra experience, capped at 10 points
            scores.append(min((exp - min_exp) * 2, 10.0))
    return scores

@explainX()
def calculate_domain_scores(apps: List[Dict[str, Any]], target_domain: str) -> List[float]:
    """Scores based on domain match for all applicants."""
    scores = []
    for app in apps:
        if app["domain"] == target_domain:
            scores.append(20.0)
        else:
            scores.append(0.0)
    return scores

@explainX()
def calculate_salary_scores(apps: List[Dict[str, Any]], jd_salary: float) -> List[float]:
    """
    Scores based on expected salary match for all applicants.
    """
    scores = []
    for app in apps:
        expected = app["expected_salary"]
        
        # If expected is less than or equal to JD offer, it's good (within reason)
        if expected <= jd_salary:
            scores.append(10.0)
            continue
        
        # If expected is higher
        diff_percent = (expected - jd_salary) / jd_salary
        
        if diff_percent <= 0.1: # Within 10% higher
            scores.append(5.0)
        elif diff_percent <= 0.2: # Within 20% higher
            scores.append(0.0)
        else: # Too expensive
            scores.append(-20.0)
    return scores

@explainX()
def calculate_cgpa_scores(apps: List[Dict[str, Any]]) -> List[float]:
    """Scores based on CGPA for all applicants."""
    scores = []
    for app in apps:
        cgpa = app["cgpa"]
        if cgpa < 6.0: 
            scores.append(0.0)
        else:
            scores.append((cgpa - 6.0) * 2.5)
    return scores

@explainX()
def process_applications(applications: List[Dict[str, Any]], jd: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Main pipeline to process applications against a Job Description.
    Returns top 10 matches.
    """
    # 1. Batch Validation
    valid_flags = validate_users(applications)
    
    # 2. Batch Experience Check
    exp_scores = calculate_experience_scores(applications, jd["min_experience"])
    
    # 3. Batch Domain Check
    domain_scores = calculate_domain_scores(applications, jd["domain"])
    
    # 4. Batch Salary Check
    salary_scores = calculate_salary_scores(applications, jd["salary_budget"])
    
    # 5. Batch CGPA Check
    cgpa_scores = calculate_cgpa_scores(applications)

    scored_apps = []
    
    # Combine results
    for i, app in enumerate(applications):
        # Filter invalid users
        if not valid_flags[i]:
            continue
            
        # Filter disqualified experience
        if exp_scores[i] == -100.0:
            continue
            
        # Calculate total score
        total_score = (
            exp_scores[i] + 
            domain_scores[i] + 
            salary_scores[i] + 
            cgpa_scores[i]
        )
        
        # Store result
        app_result = app.copy()
        app_result["final_score"] = round(total_score, 2)
        scored_apps.append(app_result)
        
    # Sort by score descending
    scored_apps.sort(key=lambda x: x["final_score"], reverse=True)
    
    # Return top 10
    return scored_apps[:10]
