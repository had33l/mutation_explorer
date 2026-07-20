# from typing import Dict, Any, List

# class ACMGEngine:
#     """
#     Dynamic ACMG/AMP criteria inference based on available data.
#     No hardcoded rules - everything inferred from data.
#     """
    
#     @staticmethod
#     def infer_criteria(
#         vep_data: Dict[str, Any],
#         clinvar_data: Dict[str, Any],
#         gnomad_data: Dict[str, Any],
#         protein_data: Dict[str, Any]
#     ) -> Dict[str, Any]:
#         """
#         Infer ACMG criteria dynamically from available evidence.
#         """
#         criteria = []
#         evidence = []
        
#         # Get clinical significance from ClinVar first (most authoritative)
#         clinvar_status = clinvar_data.get("status", "").lower()
        
#         # If ClinVar already has a classification, use it as primary evidence
#         if clinvar_status:
#             if "pathogenic" in clinvar_status and "likely" not in clinvar_status:
#                 criteria.append("PS1")
#                 evidence.append("ClinVar classifies this variant as Pathogenic")
#             elif "likely pathogenic" in clinvar_status:
#                 criteria.append("PM2")
#                 evidence.append("ClinVar classifies this variant as Likely Pathogenic")
#             elif "benign" in clinvar_status and "likely" not in clinvar_status:
#                 criteria.append("BS1")
#                 evidence.append("ClinVar classifies this variant as Benign")
#             elif "likely benign" in clinvar_status:
#                 criteria.append("BP4")
#                 evidence.append("ClinVar classifies this variant as Likely Benign")
        
#         # PVS1: Pathogenic null variant (ONLY for truly null variants)
#         consequences = vep_data.get("consequence", [])
#         null_consequences = ["frameshift_variant", "stop_gained", "splice_acceptor_variant", "splice_donor_variant"]
        
#         # Check if variant is truly null (not just predicted)
#         is_null = any(c in null_consequences for c in consequences)
#         if is_null:
#             criteria.append("PVS1")
#             evidence.append("Null variant (frameshift/stop gained/splice site)")
        
#         # PM2: Absent from population databases (only if truly rare)
#         frequency = gnomad_data.get("frequency")
#         if frequency:
#             try:
#                 af = float(frequency)
#                 if af < 0.0001:  # Extremely rare (< 0.01%)
#                     criteria.append("PM2")
#                     evidence.append(f"Extremely rare in population databases (AF: {af:.6f})")
#                 elif af > 0.05:  # Common variant (> 5%)
#                     criteria.append("BS1")
#                     evidence.append(f"Common in population databases (AF: {af:.6f} > 5%)")
#                 elif af > 0.01:  # Frequent (> 1%)
#                     criteria.append("BP4")
#                     evidence.append(f"Frequent in population databases (AF: {af:.6f} > 1%)")
#             except:
#                 pass
#         else:
#             # If frequency data is missing, don't apply PM2
#             evidence.append("Population frequency data not available")
        
#         # PP3: Multiple computational predictors agree damaging
#         # Only apply if we have actual predictions
#         sift = vep_data.get("sift")
#         polyphen = vep_data.get("polyphen")
        
#         damaging_count = 0
#         if sift == "deleterious":
#             damaging_count += 1
#         if polyphen in ["probably_damaging", "possibly_damaging"]:
#             damaging_count += 1
        
#         if damaging_count >= 2:
#             criteria.append("PP3")
#             evidence.append("Multiple computational predictors agree this is damaging")
#         elif damaging_count == 0:
#             # If predictions say benign, add benign evidence
#             if sift == "tolerated" or polyphen == "benign":
#                 criteria.append("BP4")
#                 evidence.append("Computational predictors suggest benign effect")
        
#         # PS1: Same amino acid change reported pathogenic
#         # This should ONLY come from ClinVar data, not assumed
#         if "PS1" not in criteria and clinvar_status and "pathogenic" in clinvar_status:
#             criteria.append("PS1")
#             evidence.append("Same amino acid change reported as pathogenic in ClinVar")
        
#         # Build classification based on criteria
#         classification = ACMGEngine._classify(criteria, clinvar_status)
        
#         return {
#             "classification": classification,
#             "criteria": criteria,
#             "evidence": evidence,
#         }
    
#     @staticmethod
#     def _classify(criteria: List[str], clinvar_status: str) -> Dict[str, Any]:
#         """
#         Classify based on criteria collected and ClinVar status.
#         """
#         # If ClinVar says Pathogenic, trust it (with criteria)
#         if "pathogenic" in clinvar_status and "likely" not in clinvar_status:
#             # Verify there's supporting evidence
#             if any(c in ["PVS1", "PS1", "PM2", "PP3"] for c in criteria):
#                 return {"status": "Pathogenic", "confidence": "High"}
        
#         # If ClinVar says Benign, trust it
#         if "benign" in clinvar_status and "likely" not in clinvar_status:
#             if any(c in ["BS1", "BP4"] for c in criteria) or not any(c in ["PVS1", "PS1", "PM2"] for c in criteria):
#                 return {"status": "Benign", "confidence": "High"}
        
#         # Count pathogenic and benign criteria
#         pathogenic_criteria = ["PVS1", "PS1", "PM2", "PP3", "PS2", "PM3", "PM4", "PM5", "PM6", "PP1", "PP2", "PP4", "PP5"]
#         benign_criteria = ["BA1", "BS1", "BS2", "BS3", "BS4", "BP1", "BP2", "BP3", "BP4", "BP5", "BP6", "BP7"]
        
#         pathogenic_count = sum(1 for c in criteria if c in pathogenic_criteria)
#         benign_count = sum(1 for c in criteria if c in benign_criteria)
        
#         # Classification logic
#         if pathogenic_count >= 2 and benign_count == 0:
#             return {"status": "Pathogenic", "confidence": "High"}
#         elif pathogenic_count >= 1 and benign_count == 0:
#             return {"status": "Likely Pathogenic", "confidence": "Moderate"}
#         elif benign_count >= 2 and pathogenic_count == 0:
#             return {"status": "Benign", "confidence": "High"}
#         elif benign_count >= 1 and pathogenic_count == 0:
#             return {"status": "Likely Benign", "confidence": "Moderate"}
#         elif pathogenic_count > 0 and benign_count > 0:
#             # Conflicting evidence - check what's stronger
#             if pathogenic_count >= benign_count:
#                 return {"status": "Uncertain Significance", "confidence": "Low", "note": "Conflicting evidence"}
#             else:
#                 return {"status": "Uncertain Significance", "confidence": "Low", "note": "Conflicting evidence"}
#         else:
#             return {"status": "Uncertain Significance", "confidence": "Low"}


from typing import Dict, Any, List

class ACMGEngine:
    """
    Dynamic ACMG/AMP criteria inference based on available data.
    No hardcoded rules - everything inferred from data.
    """
    
    @staticmethod
    def infer_criteria(
        vep_data: Dict[str, Any],
        clinvar_data: Dict[str, Any],
        gnomad_data: Dict[str, Any],
        protein_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Infer ACMG criteria dynamically from available evidence.
        """
        criteria = []
        evidence = []
        
        # Get clinical significance from ClinVar first (most authoritative)
        clinvar_status = clinvar_data.get("status", "").lower()
        
        # If ClinVar already has a classification, use it as primary evidence
        if clinvar_status:
            if "pathogenic" in clinvar_status and "likely" not in clinvar_status:
                criteria.append("PS1")
                evidence.append("ClinVar classifies this variant as Pathogenic")
            elif "likely pathogenic" in clinvar_status:
                criteria.append("PM2")
                evidence.append("ClinVar classifies this variant as Likely Pathogenic")
            elif "benign" in clinvar_status and "likely" not in clinvar_status:
                criteria.append("BS1")
                evidence.append("ClinVar classifies this variant as Benign")
            elif "likely benign" in clinvar_status:
                criteria.append("BP4")
                evidence.append("ClinVar classifies this variant as Likely Benign")
        
        # PVS1: Pathogenic null variant (ONLY for truly null variants)
        consequences = vep_data.get("consequence", [])
        null_consequences = ["frameshift_variant", "stop_gained", "splice_acceptor_variant", "splice_donor_variant"]
        
        # Check if variant is truly null (not just predicted)
        is_null = any(c in null_consequences for c in consequences)
        if is_null:
            criteria.append("PVS1")
            evidence.append("Null variant (frameshift/stop gained/splice site)")
        
        # PM2: Absent from population databases (only if truly rare)
        frequency = gnomad_data.get("frequency")
        if frequency:
            try:
                af = float(frequency)
                if af < 0.0001:  # Extremely rare (< 0.01%)
                    criteria.append("PM2")
                    evidence.append(f"Extremely rare in population databases (AF: {af:.6f})")
                elif af > 0.05:  # Common variant (> 5%)
                    criteria.append("BS1")
                    evidence.append(f"Common in population databases (AF: {af:.6f} > 5%)")
                elif af > 0.01:  # Frequent (> 1%)
                    criteria.append("BP4")
                    evidence.append(f"Frequent in population databases (AF: {af:.6f} > 1%)")
            except:
                pass
        else:
            # If frequency data is missing, don't apply PM2
            evidence.append("Population frequency data not available")
        
        # PP3: Multiple computational predictors agree damaging
        # Only apply if we have actual predictions
        sift = vep_data.get("sift")
        polyphen = vep_data.get("polyphen")
        
        damaging_count = 0
        if sift == "deleterious":
            damaging_count += 1
        if polyphen in ["probably_damaging", "possibly_damaging"]:
            damaging_count += 1
        
        if damaging_count >= 2:
            criteria.append("PP3")
            evidence.append("Multiple computational predictors agree this is damaging")
        elif damaging_count == 0:
            # If predictions say benign, add benign evidence
            if sift == "tolerated" or polyphen == "benign":
                criteria.append("BP4")
                evidence.append("Computational predictors suggest benign effect")
        
        # PS1: Same amino acid change reported pathogenic
        # This should ONLY come from ClinVar data, not assumed
        if "PS1" not in criteria and clinvar_status and "pathogenic" in clinvar_status:
            criteria.append("PS1")
            evidence.append("Same amino acid change reported as pathogenic in ClinVar")
        
        # Build classification based on criteria
        classification = ACMGEngine._classify(criteria, clinvar_status)
        
        return {
            "classification": classification,
            "criteria": criteria,
            "evidence": evidence,
        }
    
    @staticmethod
    def _classify(criteria: List[str], clinvar_status: str) -> Dict[str, Any]:
        """
        Classify based on criteria collected and ClinVar status.
        """
        # If ClinVar says Pathogenic, trust it (with criteria)
        if "pathogenic" in clinvar_status and "likely" not in clinvar_status:
            # Verify there's supporting evidence
            if any(c in ["PVS1", "PS1", "PM2", "PP3"] for c in criteria):
                return {"status": "Pathogenic", "confidence": "High"}
        
        # If ClinVar says Benign, trust it
        if "benign" in clinvar_status and "likely" not in clinvar_status:
            if any(c in ["BS1", "BP4"] for c in criteria) or not any(c in ["PVS1", "PS1", "PM2"] for c in criteria):
                return {"status": "Benign", "confidence": "High"}
        
        # Count pathogenic and benign criteria
        pathogenic_criteria = ["PVS1", "PS1", "PM2", "PP3", "PS2", "PM3", "PM4", "PM5", "PM6", "PP1", "PP2", "PP4", "PP5"]
        benign_criteria = ["BA1", "BS1", "BS2", "BS3", "BS4", "BP1", "BP2", "BP3", "BP4", "BP5", "BP6", "BP7"]
        
        pathogenic_count = sum(1 for c in criteria if c in pathogenic_criteria)
        benign_count = sum(1 for c in criteria if c in benign_criteria)
        
        # Classification logic
        if pathogenic_count >= 2 and benign_count == 0:
            return {"status": "Pathogenic", "confidence": "High"}
        elif pathogenic_count >= 1 and benign_count == 0:
            return {"status": "Likely Pathogenic", "confidence": "Moderate"}
        elif benign_count >= 2 and pathogenic_count == 0:
            return {"status": "Benign", "confidence": "High"}
        elif benign_count >= 1 and pathogenic_count == 0:
            return {"status": "Likely Benign", "confidence": "Moderate"}
        elif pathogenic_count > 0 and benign_count > 0:
            # Conflicting evidence - check what's stronger
            if pathogenic_count >= benign_count:
                return {"status": "Uncertain Significance", "confidence": "Low", "note": "Conflicting evidence"}
            else:
                return {"status": "Uncertain Significance", "confidence": "Low", "note": "Conflicting evidence"}
        else:
            return {"status": "Uncertain Significance", "confidence": "Low"}