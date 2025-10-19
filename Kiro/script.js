/**
 * Anti-PUA Debate Bot - Main Application Script
 * Implements preset data management and opinion selection functionality
 */

// ===== PRESET DATA STORE COMPONENT =====

/**
 * PresetDataStore - Manages categorized preset opinions for quick selection
 * Provides methods to retrieve presets by category and manage preset data
 */
class PresetDataStore {
    constructor() {
        this.presets = {
            classic: [
                "Money can't buy happiness",
                "Everything happens for a reason",
                "Hard work always pays off",
                "You can be anything you want if you just believe",
                "Follow your passion and the money will follow",
                "Good things come to those who wait",
                "What doesn't kill you makes you stronger",
                "The customer is always right"
            ],
            workplace: [
                "We're like a family here",
                "You should be grateful to have a job",
                "If you can't handle the pressure, maybe this isn't for you",
                "We only hire rockstars and ninjas",
                "Work hard, play hard",
                "You need to be more of a team player",
                "This is a great learning opportunity (for unpaid work)",
                "We expect 110% from everyone",
                "You're not management material",
                "That's not in your job description, but we need you to do it anyway"
            ],
            antiDiscipline: [
                "Discipline is just another word for self-oppression",
                "Rules are meant to be broken",
                "Structure kills creativity",
                "Deadlines are just suggestions",
                "Planning ahead is for people who lack spontaneity",
                "Consistency is the hobgoblin of little minds",
                "Schedules are for robots, not humans",
                "Why prepare when you can just wing it?",
                "Routine is the enemy of innovation",
                "Organization is overrated"
            ]
        };
    }

    /**
     * Get all presets for a specific category
     * @param {string} category - The category name ('classic', 'workplace', 'antiDiscipline')
     * @returns {Array<string>} Array of preset opinion strings
     */
    getPresetsByCategory(category) {
        const normalizedCategory = this.normalizeCategory(category);
        return this.presets[normalizedCategory] || [];
    }

    /**
     * Get all available categories
     * @returns {Array<string>} Array of category names
     */
    getCategories() {
        return Object.keys(this.presets);
    }

    /**
     * Get a random preset from a specific category
     * @param {string} category - The category name
     * @returns {string|null} Random preset opinion or null if category doesn't exist
     */
    getRandomPreset(category) {
        const presets = this.getPresetsByCategory(category);
        if (presets.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * presets.length);
        return presets[randomIndex];
    }

    /**
     * Get total count of presets in a category
     * @param {string} category - The category name
     * @returns {number} Number of presets in the category
     */
    getPresetCount(category) {
        return this.getPresetsByCategory(category).length;
    }

    /**
     * Get all presets from all categories
     * @returns {Object} Object with all categories and their presets
     */
    getAllPresets() {
        return { ...this.presets };
    }

    /**
     * Normalize category name to handle different input formats
     * @param {string} category - The category name to normalize
     * @returns {string} Normalized category name
     * @private
     */
    normalizeCategory(category) {
        const categoryMap = {
            'classic': 'classic',
            'workplace': 'workplace',
            'workplace-pua': 'workplace',
            'workplacepua': 'workplace',
            'anti-discipline': 'antiDiscipline',
            'antidiscipline': 'antiDiscipline',
            'discipline': 'antiDiscipline'
        };

        const normalized = category.toLowerCase().replace(/[^a-z]/g, '');
        return categoryMap[normalized] || categoryMap[category.toLowerCase()] || category;
    }

    /**
     * Search for presets containing specific text across all categories
     * @param {string} searchTerm - Text to search for
     * @returns {Object} Object with categories as keys and matching presets as values
     */
    searchPresets(searchTerm) {
        const results = {};
        const term = searchTerm.toLowerCase();

        for (const [category, presets] of Object.entries(this.presets)) {
            const matches = presets.filter(preset =>
                preset.toLowerCase().includes(term)
            );
            if (matches.length > 0) {
                results[category] = matches;
            }
        }

        return results;
    }
}

// ===== PRESET OPINION SELECTION FUNCTIONALITY =====

/**
 * PresetManager - Handles preset opinion selection and UI interactions
 * Manages the display and interaction with preset opinion buttons
 */
class PresetManager {
    constructor(dataStore) {
        this.dataStore = dataStore;
        this.selectedPreset = null;
        this.selectedCategory = null;
        this.presetButtons = new Map(); // Store button references for efficient updates

        this.init();
    }

    /**
     * Initialize the preset manager and populate preset buttons
     */
    init() {
        this.populatePresetButtons();
        this.setupEventListeners();
    }

    /**
     * Populate preset buttons in the UI for all categories
     */
    populatePresetButtons() {
        const categories = [
            { key: 'classic', containerId: 'classicPresets' },
            { key: 'workplace', containerId: 'workplacePresets' },
            { key: 'antiDiscipline', containerId: 'antiDisciplinePresets' }
        ];

        categories.forEach(({ key, containerId }) => {
            this.createCategoryButtons(key, containerId);
        });
    }

    /**
     * Create preset buttons for a specific category
     * @param {string} category - Category key
     * @param {string} containerId - DOM container ID for the buttons
     */
    createCategoryButtons(category, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found for category ${category}`);
            return;
        }

        const presets = this.dataStore.getPresetsByCategory(category);
        container.innerHTML = ''; // Clear existing buttons

        presets.forEach((preset, index) => {
            const button = this.createPresetButton(preset, category, index);
            container.appendChild(button);

            // Store button reference for efficient updates
            const buttonKey = `${category}-${index}`;
            this.presetButtons.set(buttonKey, button);
        });
    }

    /**
     * Create a single preset button element
     * @param {string} presetText - The preset opinion text
     * @param {string} category - The category this preset belongs to
     * @param {number} index - The index of this preset in the category
     * @returns {HTMLButtonElement} The created button element
     */
    createPresetButton(presetText, category, index) {
        const button = document.createElement('button');
        button.className = 'preset-btn';
        button.textContent = presetText;
        button.setAttribute('data-category', category);
        button.setAttribute('data-index', index);
        button.setAttribute('data-preset', presetText);
        button.setAttribute('aria-label', `Select preset: ${presetText}`);

        // Add click event listener
        button.addEventListener('click', (e) => {
            this.handlePresetSelection(e.target);
        });

        return button;
    }

    /**
     * Handle preset button selection
     * @param {HTMLButtonElement} button - The clicked preset button
     */
    handlePresetSelection(button) {
        const presetText = button.getAttribute('data-preset');
        const category = button.getAttribute('data-category');

        // Update selection state
        this.selectedPreset = presetText;
        this.selectedCategory = category;

        // Update visual feedback
        this.updateButtonSelection(button);

        // Fill the input field with selected preset
        this.fillSuggestion(presetText);

        // Provide user feedback
        this.showSelectionFeedback(presetText, category);

        // Emit custom event for other components
        const presetSelectedEvent = new CustomEvent('presetSelected', {
            detail: { preset: presetText, category }
        });
        document.dispatchEvent(presetSelectedEvent);
    }

    /**
     * Fill the opinion input field with preset text
     * @param {string} presetText - The preset text to fill
     */
    fillSuggestion(presetText) {
        const inputField = document.getElementById('opinionInput');
        if (inputField) {
            inputField.value = presetText;
            inputField.focus();

            // Trigger input event to update character count
            inputField.dispatchEvent(new Event('input', { bubbles: true }));

            // Add visual feedback that text was filled
            inputField.classList.add('preset-filled');
            setTimeout(() => {
                inputField.classList.remove('preset-filled');
            }, 1000);
        }
    }

    /**
     * Update visual selection state of preset buttons
     * @param {HTMLButtonElement} selectedButton - The newly selected button
     */
    updateButtonSelection(selectedButton) {
        // Remove selection from all buttons
        this.presetButtons.forEach(button => {
            button.classList.remove('selected');
        });

        // Add selection to clicked button
        selectedButton.classList.add('selected');
    }

    /**
     * Show feedback when a preset is selected
     * @param {string} presetText - The selected preset text
     * @param {string} category - The category of the selected preset
     */
    showSelectionFeedback(presetText, category) {
        // Create or update feedback element
        let feedbackElement = document.getElementById('presetFeedback');
        if (!feedbackElement) {
            feedbackElement = document.createElement('div');
            feedbackElement.id = 'presetFeedback';
            feedbackElement.className = 'preset-feedback';

            const inputSection = document.querySelector('.input-section');
            if (inputSection) {
                inputSection.insertBefore(feedbackElement, inputSection.firstChild);
            }
        }

        const categoryNames = {
            classic: 'Classic Opinion',
            workplace: 'Workplace PUA',
            antiDiscipline: 'Anti-Discipline'
        };

        feedbackElement.innerHTML = `
            <span class="feedback-icon">✓</span>
            <span class="feedback-text">Selected ${categoryNames[category]}: "${presetText.substring(0, 50)}${presetText.length > 50 ? '...' : ''}"</span>
        `;

        feedbackElement.classList.add('show');

        // Auto-hide feedback after 3 seconds
        setTimeout(() => {
            feedbackElement.classList.remove('show');
        }, 3000);
    }

    /**
     * Clear current preset selection
     */
    clearSelection() {
        this.selectedPreset = null;
        this.selectedCategory = null;

        // Remove visual selection from all buttons
        this.presetButtons.forEach(button => {
            button.classList.remove('selected');
        });

        // Hide feedback
        const feedbackElement = document.getElementById('presetFeedback');
        if (feedbackElement) {
            feedbackElement.classList.remove('show');
        }
    }

    /**
     * Get currently selected preset information
     * @returns {Object|null} Object with preset and category info, or null if none selected
     */
    getSelectedPreset() {
        if (!this.selectedPreset) return null;

        return {
            text: this.selectedPreset,
            category: this.selectedCategory
        };
    }

    /**
     * Setup additional event listeners for preset functionality
     */
    setupEventListeners() {
        // Listen for input field changes to clear selection when user types
        const inputField = document.getElementById('opinionInput');
        if (inputField) {
            let lastValue = inputField.value;

            inputField.addEventListener('input', () => {
                const currentValue = inputField.value;

                // If user manually changed the text, clear preset selection
                if (currentValue !== this.selectedPreset && currentValue !== lastValue) {
                    this.clearSelection();
                }

                lastValue = currentValue;
            });
        }

        // Listen for clear button to reset preset selection
        const clearButton = document.getElementById('clearBtn');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearSelection();
            });
        }
    }
}

// ===== INITIALIZATION =====

// Initialize the preset system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create instances
    const presetDataStore = new PresetDataStore();
    const presetManager = new PresetManager(presetDataStore);

    // Make instances globally available for other components
    window.AntiPUABot = window.AntiPUABot || {};
    window.AntiPUABot.presetDataStore = presetDataStore;
    window.AntiPUABot.presetManager = presetManager;

    console.log('Anti-PUA Bot: Preset system initialized');
    console.log(`Loaded ${presetDataStore.getPresetCount('classic')} classic presets`);
    console.log(`Loaded ${presetDataStore.getPresetCount('workplace')} workplace presets`);
    console.log(`Loaded ${presetDataStore.getPresetCount('antiDiscipline')} anti-discipline presets`);
});

// ===== INPUT HANDLER COMPONENT =====

/**
 * InputHandler - Manages input field interactions and validation
 * Handles character counting, keyboard shortcuts, and input validation
 */
class InputHandler {
    constructor() {
        this.inputField = document.getElementById('opinionInput');
        this.charCountElement = document.getElementById('charCount');
        this.submitButton = document.getElementById('submitBtn');
        this.clearButton = document.getElementById('clearBtn');
        this.maxLength = 500;
        this.isProcessing = false; // Track processing state for duplicate prevention

        this.init();
    }

    /**
     * Initialize input handler with event listeners
     */
    init() {
        if (!this.inputField) {
            console.warn('Opinion input field not found');
            return;
        }

        this.setupEventListeners();
        this.updateCharCount(); // Initialize character count
    }

    /**
     * Setup event listeners for input interactions
     */
    setupEventListeners() {
        // Character count and validation on input
        this.inputField.addEventListener('input', () => {
            this.updateCharCount();
            this.validateInput();
        });

        // Keyboard shortcuts
        this.inputField.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Clear button functionality
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.clearInput();
            });
        }

        // Form submission handling
        const form = document.getElementById('opinionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
    }

    /**
     * Update character count display
     */
    updateCharCount() {
        if (!this.charCountElement) return;

        const currentLength = this.inputField.value.length;
        this.charCountElement.textContent = `${currentLength}/${this.maxLength}`;

        // Update styling based on character count
        this.charCountElement.classList.remove('warning', 'danger');

        if (currentLength > this.maxLength * 0.9) {
            this.charCountElement.classList.add('danger');
        } else if (currentLength > this.maxLength * 0.8) {
            this.charCountElement.classList.add('warning');
        }
    }

    /**
     * Validate input and update submit button state
     */
    validateInput() {
        const text = this.inputField.value.trim();
        const isValid = text.length > 0 && text.length <= this.maxLength;

        if (this.submitButton && !this.isProcessing) {
            this.submitButton.disabled = !isValid;
        }

        return isValid;
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to submit
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (this.validateInput()) {
                this.handleSubmit();
            }
        }

        // Escape to clear input
        if (e.key === 'Escape') {
            e.preventDefault();
            this.clearInput();
        }
    }

    /**
     * Handle form submission with duplicate prevention
     */
    handleSubmit() {
        // Prevent duplicate submissions during processing
        if (this.isProcessing) {
            this.showValidationError('Please wait, your request is being processed...');
            return;
        }

        // Validate input before submission
        if (!this.validateInput()) {
            this.showValidationError('Please enter a valid opinion (1-500 characters)');
            return;
        }

        const opinion = this.inputField.value.trim();

        // Set processing state to prevent duplicates
        this.setProcessingState(true);

        // Trigger custom event for other components to handle
        const submitEvent = new CustomEvent('opinionSubmit', {
            detail: { opinion }
        });
        document.dispatchEvent(submitEvent);
    }

    /**
     * Clear input field and reset state
     */
    clearInput() {
        this.inputField.value = '';
        this.updateCharCount();
        this.validateInput();
        this.inputField.focus();

        // Clear any validation errors
        this.hideValidationError();

        // Trigger custom event for preset manager to clear selection
        const clearEvent = new CustomEvent('inputCleared');
        document.dispatchEvent(clearEvent);
    }

    /**
     * Show validation error message with enhanced feedback
     * @param {string} message - Error message to display
     * @param {string} type - Error type ('validation', 'processing', 'network')
     */
    showValidationError(message, type = 'validation') {
        let errorElement = document.getElementById('inputValidationError');

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'inputValidationError';
            errorElement.className = 'input-validation-error';

            const inputGroup = this.inputField.closest('.input-group');
            if (inputGroup) {
                inputGroup.appendChild(errorElement);
            }
        }

        // Clear existing type classes
        errorElement.classList.remove('validation-error', 'processing-error', 'network-error');

        // Add appropriate type class for styling
        errorElement.classList.add(`${type}-error`);

        // Add icon based on error type
        let icon = '';
        switch (type) {
            case 'processing':
                icon = '⏳ ';
                break;
            case 'network':
                icon = '🌐 ';
                break;
            default:
                icon = '⚠️ ';
        }

        errorElement.innerHTML = `${icon}${message}`;
        errorElement.classList.add('show');

        // Auto-hide after different durations based on type
        const hideDelay = type === 'processing' ? 3000 : 5000;
        setTimeout(() => {
            this.hideValidationError();
        }, hideDelay);
    }

    /**
     * Hide validation error message
     */
    hideValidationError() {
        const errorElement = document.getElementById('inputValidationError');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    /**
     * Get current input value
     * @returns {string} Current input text
     */
    getValue() {
        return this.inputField ? this.inputField.value.trim() : '';
    }

    /**
     * Set input value programmatically
     * @param {string} value - Text to set
     */
    setValue(value) {
        if (this.inputField) {
            this.inputField.value = value;
            this.updateCharCount();
            this.validateInput();
        }
    }

    /**
     * Set processing state to prevent duplicate submissions
     * @param {boolean} processing - Whether the form is currently processing
     */
    setProcessingState(processing) {
        this.isProcessing = processing;

        if (this.submitButton) {
            if (processing) {
                this.submitButton.disabled = true;
                this.submitButton.textContent = 'Processing...';
                this.submitButton.classList.add('processing');
            } else {
                this.submitButton.textContent = 'Generate Counter-Arguments';
                this.submitButton.classList.remove('processing');
                // Re-validate to set correct disabled state
                this.validateInput();
            }
        }

        // Disable/enable input field during processing
        if (this.inputField) {
            this.inputField.disabled = processing;
        }

        // Disable/enable clear button during processing
        if (this.clearButton) {
            this.clearButton.disabled = processing;
        }
    }

    /**
     * Get current processing state
     * @returns {boolean} Whether the form is currently processing
     */
    getProcessingState() {
        return this.isProcessing;
    }

    /**
     * Reset processing state (called when request completes or fails)
     */
    resetProcessingState() {
        this.setProcessingState(false);
        this.hideValidationError();
    }
}

// ===== CATEGORY SWITCHING FUNCTIONALITY =====

/**
 * CategorySwitcher - Handles visual feedback and category switching
 * Manages category highlighting and smooth transitions
 */
class CategorySwitcher {
    constructor() {
        this.categories = [
            { key: 'classic', element: document.querySelector('.classic-category') },
            { key: 'workplace', element: document.querySelector('.workplace-category') },
            { key: 'antiDiscipline', element: document.querySelector('.anti-discipline-category') }
        ];

        this.activeCategory = null;
        this.init();
    }

    /**
     * Initialize category switcher
     */
    init() {
        this.setupCategoryInteractions();
    }

    /**
     * Setup hover and focus interactions for categories
     */
    setupCategoryInteractions() {
        this.categories.forEach(({ key, element }) => {
            if (!element) return;

            // Add hover effects
            element.addEventListener('mouseenter', () => {
                this.highlightCategory(key);
            });

            element.addEventListener('mouseleave', () => {
                this.unhighlightCategory(key);
            });

            // Add focus management for accessibility
            const buttons = element.querySelectorAll('.preset-btn');
            buttons.forEach(button => {
                button.addEventListener('focus', () => {
                    this.highlightCategory(key);
                });

                button.addEventListener('blur', () => {
                    // Small delay to check if focus moved to another button in same category
                    setTimeout(() => {
                        const focusedElement = document.activeElement;
                        const isInSameCategory = element.contains(focusedElement);
                        if (!isInSameCategory) {
                            this.unhighlightCategory(key);
                        }
                    }, 10);
                });
            });
        });
    }

    /**
     * Highlight a category section
     * @param {string} categoryKey - Category to highlight
     */
    highlightCategory(categoryKey) {
        const category = this.categories.find(cat => cat.key === categoryKey);
        if (category && category.element) {
            category.element.classList.add('highlighted');
        }
    }

    /**
     * Remove highlight from a category section
     * @param {string} categoryKey - Category to unhighlight
     */
    unhighlightCategory(categoryKey) {
        const category = this.categories.find(cat => cat.key === categoryKey);
        if (category && category.element) {
            category.element.classList.remove('highlighted');
        }
    }

    /**
     * Set active category (when preset is selected)
     * @param {string} categoryKey - Category to set as active
     */
    setActiveCategory(categoryKey) {
        // Remove active state from all categories
        this.categories.forEach(({ element }) => {
            if (element) element.classList.remove('active');
        });

        // Set new active category
        const category = this.categories.find(cat => cat.key === categoryKey);
        if (category && category.element) {
            category.element.classList.add('active');
            this.activeCategory = categoryKey;
        }
    }

    /**
     * Clear active category
     */
    clearActiveCategory() {
        this.categories.forEach(({ element }) => {
            if (element) element.classList.remove('active');
        });
        this.activeCategory = null;
    }
}

// ===== AI SERVICE CLIENT COMPONENT =====

/**
 * AIServiceClient - Handles communication with external AI API
 * Manages API requests, authentication, and response processing
 */
class AIServiceClient {
    constructor() {
        // API Configuration based on design document
        this.apiEndpoint = 'https://api2.aigcbest.top/v1/chat/completions';
        this.model = 'DeepSeek-V3';
        this.timeout = 30000; // 30 seconds as per requirements
        this.bearerToken = null; // Will be set when needed

        // Request configuration
        this.defaultConfig = {
            temperature: 0.8,
            max_tokens: 1000,
            response_format: { type: "json_object" }
        };

        // System prompt for the AI
        this.systemPrompt = `You are a witty anti-PUA debate bot designed to counter manipulative workplace rhetoric and unreasonable statements. Your task is to generate intelligent, evidence-based counter-arguments that help users respond to workplace manipulation tactics.

When given an opinion or statement, you must respond with a JSON object containing:
1. "counter_opinions": An array of exactly 3 distinct counter-arguments, each addressing the input from a different analytical perspective
2. "humor_response": A single humorous summary comment that captures the absurdity of the original statement

Guidelines:
- Counter-arguments should be intelligent, factual, and professional
- Each counter-argument should take a different approach (logical, ethical, practical, etc.)
- The humor response should be witty but not offensive
- Focus on workplace manipulation tactics, unreasonable expectations, and toxic work culture
- Provide constructive alternatives when possible
- Keep responses concise but impactful

Example response format:
{
  "counter_opinions": [
    "Counter-argument from logical perspective",
    "Counter-argument from ethical perspective", 
    "Counter-argument from practical perspective"
  ],
  "humor_response": "A witty summary that highlights the absurdity"
}`;
    }

    /**
     * Set the Bearer token for API authentication
     * @param {string} token - The Bearer token for authentication
     */
    setBearerToken(token) {
        this.bearerToken = token;
    }

    /**
     * Generate counter-arguments for a given opinion
     * @param {string} opinion - The opinion text to counter
     * @returns {Promise<Object>} Promise resolving to parsed AI response
     * @throws {Error} Various error types for different failure scenarios
     */
    async generateCounterArguments(opinion) {
        if (!opinion || typeof opinion !== 'string' || opinion.trim().length === 0) {
            throw new Error('Invalid opinion input: Opinion must be a non-empty string');
        }

        if (!this.bearerToken) {
            throw new Error('Authentication required: Bearer token not set');
        }

        // Prepare the request payload according to OpenAI-compatible format
        const requestPayload = {
            model: this.model,
            messages: [
                {
                    role: "system",
                    content: this.systemPrompt
                },
                {
                    role: "user",
                    content: opinion.trim()
                }
            ],
            temperature: this.defaultConfig.temperature,
            max_tokens: this.defaultConfig.max_tokens,
            response_format: this.defaultConfig.response_format
        };

        // Prepare request headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.bearerToken}`,
            'Accept': 'application/json'
        };

        try {
            // Create AbortController for timeout handling
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            // Make the API request
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestPayload),
                signal: controller.signal
            });

            // Clear the timeout
            clearTimeout(timeoutId);

            // Handle HTTP errors
            if (!response.ok) {
                await this.handleHttpError(response);
            }

            // Parse the response
            const responseData = await response.json();

            // Parse and validate the AI response
            return this.parseResponse(responseData);

        } catch (error) {
            // Handle different types of errors
            if (error.name === 'AbortError') {
                throw new Error('Request timeout: The AI service took too long to respond (>30 seconds)');
            }

            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to AI service. Please check your internet connection');
            }

            // Re-throw other errors as-is
            throw error;
        }
    }

    /**
     * Handle HTTP error responses with specific error messages
     * @param {Response} response - The fetch response object
     * @throws {Error} Specific error based on HTTP status
     * @private
     */
    async handleHttpError(response) {
        let errorMessage = 'AI service error';

        try {
            const errorData = await response.json();
            if (errorData.error && errorData.error.message) {
                errorMessage = errorData.error.message;
            }
        } catch (parseError) {
            // If we can't parse error response, use status-based messages
        }

        switch (response.status) {
            case 400:
                throw new Error(`Bad request: ${errorMessage}`);
            case 401:
                throw new Error('Authentication failed: Invalid or expired Bearer token');
            case 403:
                throw new Error('Access forbidden: Insufficient permissions for AI service');
            case 429:
                throw new Error('Rate limit exceeded: Too many requests. Please wait a moment and try again');
            case 500:
                throw new Error('AI service internal error: Please try again later');
            case 502:
            case 503:
            case 504:
                throw new Error('AI service temporarily unavailable: Please try again later');
            default:
                throw new Error(`AI service error (${response.status}): ${errorMessage}`);
        }
    }

    /**
     * Parse and validate AI response according to expected format
     * @param {Object} apiResponse - Raw API response from the service
     * @returns {Object} Parsed and validated response object
     * @throws {Error} If response format is invalid
     */
    parseResponse(apiResponse) {
        // Validate basic response structure
        if (!apiResponse || typeof apiResponse !== 'object') {
            throw new Error('Invalid API response: Response is not a valid object');
        }

        if (!apiResponse.choices || !Array.isArray(apiResponse.choices) || apiResponse.choices.length === 0) {
            throw new Error('Invalid API response: No choices found in response');
        }

        const choice = apiResponse.choices[0];
        if (!choice.message || !choice.message.content) {
            throw new Error('Invalid API response: No message content found');
        }

        let parsedContent;
        try {
            parsedContent = JSON.parse(choice.message.content);
        } catch (parseError) {
            throw new Error('Invalid AI response: Response content is not valid JSON');
        }

        // Validate required fields according to design specification
        if (!parsedContent.counter_opinions || !Array.isArray(parsedContent.counter_opinions)) {
            throw new Error('Invalid AI response: counter_opinions must be an array');
        }

        if (parsedContent.counter_opinions.length !== 3) {
            throw new Error('Invalid AI response: Exactly 3 counter-arguments required');
        }

        if (!parsedContent.humor_response || typeof parsedContent.humor_response !== 'string') {
            throw new Error('Invalid AI response: humor_response must be a string');
        }

        // Validate that all counter-arguments are non-empty strings
        for (let i = 0; i < parsedContent.counter_opinions.length; i++) {
            const opinion = parsedContent.counter_opinions[i];
            if (!opinion || typeof opinion !== 'string' || opinion.trim().length === 0) {
                throw new Error(`Invalid AI response: Counter-argument ${i + 1} is empty or invalid`);
            }
        }

        // Validate humor response is not empty
        if (parsedContent.humor_response.trim().length === 0) {
            throw new Error('Invalid AI response: Humor response is empty');
        }

        // Return validated and cleaned response
        return {
            counterOpinions: parsedContent.counter_opinions.map(opinion => opinion.trim()),
            humorResponse: parsedContent.humor_response.trim(),
            generatedAt: new Date(),
            model: this.model,
            originalOpinion: null // Will be set by calling component
        };
    }

    /**
     * Test the API connection and authentication
     * @returns {Promise<boolean>} Promise resolving to true if connection is successful
     * @throws {Error} If connection test fails
     */
    async testConnection() {
        const testOpinion = "This is a test opinion to verify API connectivity.";

        try {
            await this.generateCounterArguments(testOpinion);
            return true;
        } catch (error) {
            throw new Error(`Connection test failed: ${error.message}`);
        }
    }

    /**
     * Get current API configuration
     * @returns {Object} Current configuration object
     */
    getConfig() {
        return {
            apiEndpoint: this.apiEndpoint,
            model: this.model,
            timeout: this.timeout,
            hasToken: !!this.bearerToken,
            defaultConfig: { ...this.defaultConfig }
        };
    }

    /**
     * Update API configuration
     * @param {Object} config - Configuration object with optional properties
     */
    updateConfig(config) {
        if (config.apiEndpoint && typeof config.apiEndpoint === 'string') {
            this.apiEndpoint = config.apiEndpoint;
        }

        if (config.model && typeof config.model === 'string') {
            this.model = config.model;
        }

        if (config.timeout && typeof config.timeout === 'number' && config.timeout > 0) {
            this.timeout = config.timeout;
        }

        if (config.temperature && typeof config.temperature === 'number') {
            this.defaultConfig.temperature = Math.max(0, Math.min(2, config.temperature));
        }

        if (config.max_tokens && typeof config.max_tokens === 'number' && config.max_tokens > 0) {
            this.defaultConfig.max_tokens = config.max_tokens;
        }
    }
}

// ===== DISPLAY HELPER FUNCTIONS =====

/**
 * Show loading state in the results panel
 */
function showLoadingState() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const resultsContent = document.getElementById('resultsContent');

    if (loadingState) {
        loadingState.style.display = 'flex';
    }

    if (errorState) {
        errorState.style.display = 'none';
    }

    if (resultsContent) {
        resultsContent.style.display = 'none';
    }
}

/**
 * Show error state with message
 * @param {string} message - Error message to display
 */
function showErrorState(message) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    const resultsContent = document.getElementById('resultsContent');

    if (loadingState) {
        loadingState.style.display = 'none';
    }

    if (errorState) {
        errorState.style.display = 'flex';
    }

    if (errorMessage) {
        errorMessage.textContent = message || 'An unexpected error occurred. Please try again.';
    }

    if (resultsContent) {
        resultsContent.style.display = 'none';
    }
}

/**
 * Display AI-generated results
 * @param {Object} response - Parsed AI response object
 */
function displayResults(response) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const resultsContent = document.getElementById('resultsContent');

    // Hide loading and error states
    if (loadingState) {
        loadingState.style.display = 'none';
    }

    if (errorState) {
        errorState.style.display = 'none';
    }

    // Show results content
    if (resultsContent) {
        resultsContent.style.display = 'block';
    }

    // Display original opinion
    displayOriginalOpinion(response.originalOpinion);

    // Display counter-arguments
    displayCounterArguments(response.counterOpinions);

    // Display humor response
    displayHumorResponse(response.humorResponse);
}

/**
 * Display the original opinion
 * @param {string} opinion - The original opinion text
 */
function displayOriginalOpinion(opinion) {
    const originalOpinionSection = document.getElementById('originalOpinion');
    const originalOpinionText = document.getElementById('originalOpinionText');

    if (originalOpinionSection && originalOpinionText) {
        originalOpinionText.textContent = opinion;
        originalOpinionSection.style.display = 'block';
    }
}

/**
 * Display counter-arguments with animation
 * @param {Array<string>} counterOpinions - Array of counter-argument strings
 */
function displayCounterArguments(counterOpinions) {
    const counterArgumentsSection = document.getElementById('counterArguments');
    const argumentsList = document.getElementById('argumentsList');

    if (!counterArgumentsSection || !argumentsList) return;

    // Clear existing arguments
    argumentsList.innerHTML = '';

    // Add each counter-argument
    counterOpinions.forEach((argument, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = argument;
        listItem.style.animationDelay = `${index * 0.1}s`;
        argumentsList.appendChild(listItem);
    });

    counterArgumentsSection.style.display = 'block';
}

/**
 * Display humor response
 * @param {string} humorResponse - The humor response text
 */
function displayHumorResponse(humorResponse) {
    const humorResponseSection = document.getElementById('humorResponse');
    const humorContent = document.getElementById('humorContent');

    if (humorResponseSection && humorContent) {
        humorContent.textContent = humorResponse;
        humorResponseSection.style.display = 'block';
    }
}

// ===== ENHANCED INITIALIZATION =====

// Update the initialization to include new components
document.addEventListener('DOMContentLoaded', () => {
    // Create instances
    const presetDataStore = new PresetDataStore();
    const presetManager = new PresetManager(presetDataStore);
    const inputHandler = new InputHandler();
    const categorySwitcher = new CategorySwitcher();
    const aiServiceClient = new AIServiceClient();

    // Setup cross-component communication

    // Listen for preset selection to update category switcher
    document.addEventListener('presetSelected', (e) => {
        const { category } = e.detail;
        categorySwitcher.setActiveCategory(category);
    });

    // Listen for input cleared to reset category switcher
    document.addEventListener('inputCleared', () => {
        categorySwitcher.clearActiveCategory();
        presetManager.clearSelection();
    });

    // Listen for opinion submission to handle AI processing
    document.addEventListener('opinionSubmit', async (e) => {
        const { opinion } = e.detail;
        console.log('Opinion submitted:', opinion);

        try {
            // Show loading state
            showLoadingState();

            // For demo purposes, we'll need a Bearer token
            // In a real implementation, this would come from user authentication
            const demoToken = '';
            aiServiceClient.setBearerToken(demoToken);

            // Generate counter-arguments using AI service
            const response = await aiServiceClient.generateCounterArguments(opinion);
            response.originalOpinion = opinion;

            // Display results
            displayResults(response);

            // Reset processing state
            inputHandler.resetProcessingState();

        } catch (error) {
            console.error('AI service error:', error);

            // Show error state with user-friendly message
            showErrorState(error.message);

            // Reset processing state
            inputHandler.resetProcessingState();
        }
    });

    // Make instances globally available
    window.AntiPUABot = window.AntiPUABot || {};
    window.AntiPUABot.presetDataStore = presetDataStore;
    window.AntiPUABot.presetManager = presetManager;
    window.AntiPUABot.inputHandler = inputHandler;
    window.AntiPUABot.categorySwitcher = categorySwitcher;
    window.AntiPUABot.aiServiceClient = aiServiceClient;

    console.log('Anti-PUA Bot: All components initialized successfully');
});