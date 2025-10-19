# Contributing to PORTUS AI

Thank you for your interest in contributing to PORTUS AI! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Azure OpenAI API access (for testing)

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/portus-ai.git
   cd portus-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your Azure OpenAI credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 How to Contribute

### Reporting Issues

- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include system information (OS, Node version, etc.)
- Use appropriate labels

### Suggesting Features

- Open a discussion or issue
- Describe the use case and benefits
- Consider implementation complexity
- Follow the project's vision

### Code Contributions

1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Follow the coding standards
   - Add tests if applicable
   - Update documentation

3. **Test your changes**
   ```bash
   npm run type-check
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**

## 🎯 Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type usage
- Use meaningful variable names

### React

- Use functional components with hooks
- Follow React best practices
- Use proper prop types
- Implement error boundaries

### Styling

- Use Tailwind CSS classes
- Follow the design system
- Ensure responsive design
- Maintain accessibility standards

### Code Style

- Use Prettier for formatting
- Follow ESLint rules
- Write self-documenting code
- Add JSDoc comments for functions

## 🧪 Testing

### Manual Testing

- Test all new features thoroughly
- Verify multi-language support
- Check responsive design
- Test export functionality

### Test Scenarios

- Language detection accuracy
- Port map interactions
- Analysis display functionality
- Error handling

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex logic
- Update README for new features
- Maintain API documentation

### User Documentation

- Update user guides
- Add screenshots for UI changes
- Document new features
- Maintain troubleshooting guides

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows project standards
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design verified

### PR Description

- Clear description of changes
- Reference related issues
- Include screenshots if UI changes
- List breaking changes if any

### Review Process

- Maintainers will review within 48 hours
- Address feedback promptly
- Keep PRs focused and small
- Respond to comments professionally

## 🏷️ Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority: high`: Urgent issues
- `priority: low`: Low priority
- `priority: medium`: Medium priority

## 🤝 Community Guidelines

### Be Respectful

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Be Professional

- Keep discussions on-topic
- Avoid spam or off-topic comments
- Use clear and concise language
- Follow the code of conduct

## 📞 Getting Help

### Resources

- [GitHub Discussions](https://github.com/portus-ai/portus-ai/discussions)
- [Documentation](https://github.com/portus-ai/portus-ai#readme)
- [Issues](https://github.com/portus-ai/portus-ai/issues)

### Contact

- **Email**: team@portus-ai.com
- **Discord**: [Join our community](https://discord.gg/portus-ai)

## 🏆 Recognition

Contributors will be recognized in:

- README contributors section
- Release notes
- Project documentation
- Community highlights

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to PORTUS AI! 🚀
