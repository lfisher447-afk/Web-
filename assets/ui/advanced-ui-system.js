// Advanced UI System - Component Framework & Animation Engine
// Features: Layout engine, component system, animations, theming, accessibility
// Copyright 2025 - Advanced UI Framework

class UITheme {
    constructor(config = {}) {
        this.colors = {
            primary: config.primary || '#007AFF',
            secondary: config.secondary || '#5AC8FA',
            success: config.success || '#34C759',
            warning: config.warning || '#FF9500',
            error: config.error || '#FF3B30',
            background: config.background || '#F2F2F7',
            surface: config.surface || '#FFFFFF',
            text: config.text || '#000000',
            textSecondary: config.textSecondary || '#999999'
        };

        this.spacing = {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
            xxl: 48
        };

        this.typography = {
            h1: { fontSize: 32, fontWeight: 700, lineHeight: 1.2 },
            h2: { fontSize: 28, fontWeight: 700, lineHeight: 1.3 },
            h3: { fontSize: 24, fontWeight: 600, lineHeight: 1.4 },
            body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
            caption: { fontSize: 12, fontWeight: 400, lineHeight: 1.4 },
            button: { fontSize: 16, fontWeight: 600, lineHeight: 1.2 }
        };

        this.shadows = {
            sm: '0 2px 4px rgba(0,0,0,0.1)',
            md: '0 4px 8px rgba(0,0,0,0.15)',
            lg: '0 8px 16px rgba(0,0,0,0.2)',
            xl: '0 16px 32px rgba(0,0,0,0.25)'
        };

        this.radius = {
            xs: 4,
            sm: 8,
            md: 12,
            lg: 16,
            xl: 20,
            full: 9999
        };
    }
}

class AnimationEngine {
    constructor() {
        this.activeAnimations = new Map();
        this.animationFrameId = null;
        this.startTime = 0;
    }

    animate(target, properties, duration = 300, easing = 'easeInOutCubic', onUpdate = null) {
        const animation = {
            target,
            properties,
            duration,
            easing,
            onUpdate,
            startTime: Date.now(),
            initialValues: {}
        };

        // Store initial values
        for (const prop in properties) {
            const style = window.getComputedStyle(target)[prop];
            animation.initialValues[prop] = parseFloat(style) || 0;
        }

        const animationId = Math.random().toString(36).substr(2, 9);
        this.activeAnimations.set(animationId, animation);

        this.startAnimationLoop();
        return animationId;
    }

    startAnimationLoop() {
        if (this.animationFrameId) return;

        const loop = () => {
            const now = Date.now();
            let activeCount = 0;

            this.activeAnimations.forEach((animation, id) => {
                const elapsed = now - animation.startTime;
                const progress = Math.min(elapsed / animation.duration, 1);

                if (progress < 1) {
                    const eased = this.applyEasing(progress, animation.easing);
                    
                    for (const prop in animation.properties) {
                        const from = animation.initialValues[prop];
                        const to = animation.properties[prop];
                        const value = from + (to - from) * eased;
                        
                        if (prop === 'opacity') {
                            animation.target.style.opacity = value;
                        } else if (prop === 'transform') {
                            animation.target.style.transform = value;
                        } else {
                            animation.target.style[prop] = value + (prop.includes('scale') ? '' : 'px');
                        }
                    }

                    if (animation.onUpdate) animation.onUpdate(eased);
                    activeCount++;
                } else {
                    // Animation complete
                    for (const prop in animation.properties) {
                        animation.target.style[prop] = animation.properties[prop];
                    }
                    this.activeAnimations.delete(id);
                }
            });

            if (activeCount > 0) {
                this.animationFrameId = requestAnimationFrame(loop);
            } else {
                this.animationFrameId = null;
            }
        };

        this.animationFrameId = requestAnimationFrame(loop);
    }

    applyEasing(progress, easing) {
        switch (easing) {
            case 'easeInOutCubic':
                return progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            case 'easeInQuad':
                return progress * progress;
            case 'easeOutQuad':
                return 1 - (1 - progress) * (1 - progress);
            case 'easeInOutQuad':
                return progress < 0.5
                    ? 2 * progress * progress
                    : -1 + (4 - 2 * progress) * progress;
            case 'easeOutElastic':
                return progress === 0 ? 0 : progress === 1 ? 1 :
                    Math.pow(2, -10 * progress) * Math.sin((progress - 0.075) * (2 * Math.PI) / 0.3) + 1;
            case 'easeOutBounce':
                const n1 = 7.5625;
                const d1 = 2.75;
                if (progress < 1 / d1) return n1 * progress * progress;
                if (progress < 2 / d1) return n1 * (progress -= 1.5 / d1) * progress + 0.75;
                if (progress < 2.5 / d1) return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
                return n1 * (progress -= 2.625 / d1) * progress + 0.984375;
            default:
                return progress;
        }
    }

    cancel(animationId) {
        this.activeAnimations.delete(animationId);
    }

    cancelAll() {
        this.activeAnimations.clear();
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

class UIComponent {
    constructor(tag = 'div', options = {}) {
        this.element = document.createElement(tag);
        this.children = [];
        this.animationEngine = options.animationEngine || new AnimationEngine();
        this.theme = options.theme || new UITheme();
        this.props = options;

        this.setupElement();
    }

    setupElement() {
        if (this.props.className) {
            this.element.className = this.props.className;
        }
        if (this.props.style) {
            Object.assign(this.element.style, this.props.style);
        }
    }

    addClass(className) {
        this.element.classList.add(className);
        return this;
    }

    removeClass(className) {
        this.element.classList.remove(className);
        return this;
    }

    setStyle(styles) {
        Object.assign(this.element.style, styles);
        return this;
    }

    animate(properties, duration = 300, easing = 'easeInOutCubic') {
        return this.animationEngine.animate(this.element, properties, duration, easing);
    }

    append(child) {
        if (child instanceof UIComponent) {
            this.children.push(child);
            this.element.appendChild(child.element);
        } else {
            this.element.appendChild(child);
        }
        return this;
    }

    remove() {
        this.element.remove();
        return this;
    }

    onClick(callback) {
        this.element.addEventListener('click', callback);
        return this;
    }

    onHover(onEnter, onLeave) {
        this.element.addEventListener('mouseenter', onEnter);
        this.element.addEventListener('mouseleave', onLeave);
        return this;
    }

    setText(text) {
        this.element.textContent = text;
        return this;
    }

    getAttribute(attr) {
        return this.element.getAttribute(attr);
    }

    setAttribute(attr, value) {
        this.element.setAttribute(attr, value);
        return this;
    }
}

class Button extends UIComponent {
    constructor(label, options = {}) {
        super('button', options);
        this.element.textContent = label;
        this.element.className = 'ui-button';

        const theme = options.theme || new UITheme();
        const variant = options.variant || 'primary';

        const variantStyles = {
            primary: {
                backgroundColor: theme.colors.primary,
                color: theme.colors.surface,
                padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                border: 'none',
                borderRadius: theme.radius.md,
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease'
            },
            secondary: {
                backgroundColor: theme.colors.secondary,
                color: theme.colors.surface,
                padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                border: 'none',
                borderRadius: theme.radius.md,
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease'
            },
            outline: {
                backgroundColor: 'transparent',
                color: theme.colors.primary,
                padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                border: `2px solid ${theme.colors.primary}`,
                borderRadius: theme.radius.md,
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease'
            }
        };

        this.setStyle(variantStyles[variant] || variantStyles.primary);

        this.onHover(
            () => this.animate({ opacity: 0.8 }, 100),
            () => this.animate({ opacity: 1 }, 100)
        );
    }
}

class Card extends UIComponent {
    constructor(options = {}) {
        super('div', options);
        const theme = options.theme || new UITheme();

        this.setStyle({
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.md,
            boxShadow: theme.shadows.md,
            transition: 'all 0.3s ease'
        });

        this.onHover(
            () => this.animate({ boxShadow: theme.shadows.lg }, 200),
            () => this.animate({ boxShadow: theme.shadows.md }, 200)
        );
    }
}

class Modal extends UIComponent {
    constructor(content, options = {}) {
        super('div', options);
        const theme = options.theme || new UITheme();

        this.setStyle({
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        });

        const modalContent = new UIComponent('div', options);
        modalContent.setStyle({
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            maxWidth: '90%',
            maxHeight: '90%',
            boxShadow: theme.shadows.xl,
            animation: 'slideIn 0.3s ease'
        });

        modalContent.append(content);
        this.append(modalContent);
    }

    close() {
        this.animate({ opacity: 0 }, 200, 'easeOutQuad');
        setTimeout(() => this.remove(), 200);
    }
}

class LayoutEngine {
    static createFlexLayout(parent, direction = 'row', gap = 16) {
        parent.setStyle({
            display: 'flex',
            flexDirection: direction,
            gap: gap
        });
    }

    static createGridLayout(parent, columns = 3, gap = 16) {
        parent.setStyle({
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: gap
        });
    }

    static createResponsiveLayout(parent, breakpoints = {}) {
        const applyLayout = () => {
            const width = window.innerWidth;
            for (const [bp, layout] of Object.entries(breakpoints)) {
                if (width <= parseInt(bp)) {
                    Object.assign(parent.element.style, layout);
                    break;
                }
            }
        };

        applyLayout();
        window.addEventListener('resize', applyLayout);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UITheme,
        AnimationEngine,
        UIComponent,
        Button,
        Card,
        Modal,
        LayoutEngine
    };
}
