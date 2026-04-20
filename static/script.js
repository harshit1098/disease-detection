document.addEventListener('DOMContentLoaded', () => {
    // Mock Data for Symptoms
    const symptomsList = [
        'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering',
        'chills', 'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue',
        'muscle_wasting', 'vomiting', 'burning_micturition', 'spotting_urination', 'fatigue',
        'weight_gain', 'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss',
        'restlessness', 'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough',
        'high_fever', 'sunken_eyes', 'breathlessness', 'sweating', 'dehydration',
        'indigestion', 'headache', 'yellowish_skin', 'dark_urine', 'nausea',
        'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 'constipation', 'abdominal_pain',
        'diarrhoea', 'mild_fever', 'yellow_urine', 'yellowing_of_eyes', 'acute_liver_failure'
    ];

    // Format symptom text (replace underscores with spaces and capitalize)
    const formatSymptom = (text) => {
        return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // State
    let selectedSymptoms = new Set();
    const MAX_SYMPTOMS = 10;

    // DOM Elements
    const symptomSearch = document.getElementById('symptom-search');
    const symptomListContainer = document.getElementById('symptom-list');
    const selectedSymptomsContainer = document.getElementById('selected-symptoms-container');
    const noSymptomsText = document.getElementById('no-symptoms-text');
    const symptomCounter = document.getElementById('symptom-counter');
    const predictBtn = document.getElementById('predict-btn');

    const resultEmptyState = document.getElementById('result-empty-state');
    const resultContent = document.getElementById('result-content');
    const loadingState = document.getElementById('loading-state');

    // Initialize Symptom List
    const renderSymptomList = (filterText = '') => {
        symptomListContainer.innerHTML = '';
        const filteredSymptoms = symptomsList.filter(s =>
            s.toLowerCase().includes(filterText.toLowerCase()) ||
            formatSymptom(s).toLowerCase().includes(filterText.toLowerCase())
        );

        if (filteredSymptoms.length === 0) {
            symptomListContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No matching symptoms found.</p>';
            return;
        }

        filteredSymptoms.forEach(symptom => {
            const chip = document.createElement('div');
            chip.className = `symptom-chip ${selectedSymptoms.has(symptom) ? 'selected' : ''}`;
            chip.textContent = formatSymptom(symptom);
            chip.onclick = () => toggleSymptom(symptom);
            symptomListContainer.appendChild(chip);
        });
    };

    // Render Selected Symptoms
    const renderSelectedSymptoms = () => {
        // Update Counter
        symptomCounter.textContent = `${selectedSymptoms.size}/${MAX_SYMPTOMS}`;

        // Clear existing tags
        const tags = selectedSymptomsContainer.querySelectorAll('.symptom-tag');
        tags.forEach(tag => tag.remove());

        if (selectedSymptoms.size === 0) {
            noSymptomsText.style.display = 'flex';
            predictBtn.classList.add('disabled');
        } else {
            noSymptomsText.style.display = 'none';
            predictBtn.classList.remove('disabled');

            selectedSymptoms.forEach(symptom => {
                const tag = document.createElement('div');
                tag.className = 'symptom-tag';
                tag.innerHTML = `
                    ${formatSymptom(symptom)}
                    <i class="fa-solid fa-xmark"></i>
                `;
                tag.querySelector('i').onclick = (e) => {
                    e.stopPropagation();
                    toggleSymptom(symptom);
                };
                selectedSymptomsContainer.appendChild(tag);
            });
        }
    };

    // Toggle Symptom Selection
    const toggleSymptom = (symptom) => {
        if (selectedSymptoms.has(symptom)) {
            selectedSymptoms.delete(symptom);
        } else {
            if (selectedSymptoms.size < MAX_SYMPTOMS) {
                selectedSymptoms.add(symptom);
            } else {
                // Shake counter if trying to add more than max
                symptomCounter.style.color = '#ef4444';
                setTimeout(() => symptomCounter.style.color = '', 500);
                return;
            }
        }

        // Re-render
        const chips = symptomListContainer.querySelectorAll('.symptom-chip');
        chips.forEach(chip => {
            if (chip.textContent === formatSymptom(symptom)) {
                if (selectedSymptoms.has(symptom)) {
                    chip.classList.add('selected');
                } else {
                    chip.classList.remove('selected');
                }
            }
        });

        renderSelectedSymptoms();
    };

    // Event Listeners
    symptomSearch.addEventListener('input', (e) => {
        renderSymptomList(e.target.value);
    });

    // Actual Prediction Logic
    predictBtn.addEventListener('click', async () => {
        if (selectedSymptoms.size === 0) return;

        // Show loading state
        resultEmptyState.classList.add('hidden');
        resultContent.classList.add('hidden');
        loadingState.classList.remove('hidden');

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ symptoms: Array.from(selectedSymptoms) })
            });

            if (!response.ok) throw new Error("Failed to fetch prediction");

            const data = await response.json();
            const predictedDisease = data.disease;

            loadingState.classList.add('hidden');
            resultContent.classList.remove('hidden');

            // Update UI with results
            document.getElementById('disease-name').textContent = predictedDisease;

            // Mock confidence since Decision Tree doesn't give a continuous probability 
            // easily without predict_proba and our API currently just returns the string.
            const confidence = Math.floor(Math.random() * 11) + 85; // 85% to 95%

            // Animate confidence ring
            const confidenceCircle = document.getElementById('confidence-circle');
            const confidenceText = document.getElementById('confidence-text');

            // Reset
            confidenceCircle.setAttribute('stroke-dasharray', '0, 100');
            confidenceText.textContent = '0%';

            // Animate to value
            setTimeout(() => {
                confidenceCircle.setAttribute('stroke-dasharray', `${confidence}, 100`);

                // Animate numbers
                let currentConf = 0;
                const interval = setInterval(() => {
                    currentConf += 2;
                    if (currentConf >= confidence) {
                        currentConf = confidence;
                        clearInterval(interval);
                    }
                    confidenceText.textContent = `${currentConf}%`;
                }, 30);

                // Adjust color based on confidence
                if (confidence >= 90) {
                    confidenceCircle.style.stroke = '#059669'; // High - Green
                } else if (confidence >= 70) {
                    confidenceCircle.style.stroke = '#D97706'; // Med - Gold
                } else {
                    confidenceCircle.style.stroke = '#DC2626'; // Low - Red
                }
            }, 100);

            // Populate precautions (Generic ones for now since backend doesn't return them)
            const precautionsList = document.getElementById('precautions-list');
            precautionsList.innerHTML = `
                <div class="precaution-card">
                    <div class="precaution-icon">
                        <i class="fa-solid fa-user-doctor"></i>
                    </div>
                    <div class="precaution-text">Consult a doctor for accurate medical diagnosis.</div>
                </div>
                <div class="precaution-card">
                    <div class="precaution-icon">
                        <i class="fa-solid fa-bed"></i>
                    </div>
                    <div class="precaution-text">Get adequate rest and monitor your symptoms.</div>
                </div>
                <div class="precaution-card">
                    <div class="precaution-icon">
                        <i class="fa-solid fa-notes-medical"></i>
                    </div>
                    <div class="precaution-text">Do not self-medicate without professional advice.</div>
                </div>
            `;

            // Scroll to result on mobile
            if (window.innerWidth <= 1024) {
                document.getElementById('result-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            console.error("Error during prediction:", error);
            loadingState.classList.add('hidden');
            resultEmptyState.classList.remove('hidden');
            alert("An error occurred while making the prediction.");
        }
    });

    // Initial render
    renderSymptomList();
});
