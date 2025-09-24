# Contributing to SubMan

Thank you for your interest in contributing to SubMan! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- Supabase account (for backend features)
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/subman.git
   cd subman
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up Supabase (optional for frontend-only changes):
   - Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
   - Create `.env.local` with your credentials

5. Start development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: React Context + Supabase real-time
- **TypeScript**: Strict mode enabled

### Backend (Supabase)
- **Database**: PostgreSQL with RLS
- **Authentication**: Supabase Auth
- **Real-time**: WebSocket subscriptions
- **Storage**: Supabase Storage (for file uploads)

### Key Directories
- `app/` - Next.js app router pages
- `components/` - React components
- `lib/supabase/` - Supabase integration
- `lib/providers/` - React context providers
- `types/` - TypeScript type definitions

## 📝 Code Style

### TypeScript
- Use strict TypeScript
- Define interfaces for all data structures
- Use proper typing for Supabase operations

### React
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices for performance

### Styling
- Use Tailwind CSS utility classes
- Follow the existing design system
- Ensure responsive design

### Database
- Use Supabase RLS for security
- Follow PostgreSQL best practices
- Include proper indexes

## 🔄 Development Workflow

### 1. Issue First
- Check existing issues before creating new ones
- Use issue templates for consistency
- Discuss major changes before implementing

### 2. Branch Naming
```
feature/description-of-feature
bugfix/description-of-bug
hotfix/critical-issue
docs/documentation-update
```

### 3. Commit Messages
```
type(scope): description

feat(auth): add role-based permissions
fix(table): resolve pagination issue
docs(setup): update Supabase guide
```

### 4. Pull Request Process
- Use the PR template
- Include screenshots for UI changes
- Test with Supabase backend
- Ensure CI passes

## 🧪 Testing

### Frontend Testing
```bash
# Lint code
npm run lint

# Type checking
npx tsc --noEmit

# Build check
npm run build
```

### Database Testing
- Test RLS policies
- Verify data integrity
- Check performance with large datasets

### Integration Testing
- Test real-time features
- Verify authentication flows
- Check cross-browser compatibility

## 🎯 Contribution Areas

### High Priority
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Mobile responsiveness
- [ ] Documentation updates

### Medium Priority
- [ ] New analytics features
- [ ] Enhanced UI components
- [ ] Export/import improvements
- [ ] Real-time notifications

### Future Features
- [ ] Mobile app (React Native)
- [ ] API documentation
- [ ] Third-party integrations
- [ ] Advanced reporting

## 🐛 Bug Reports

When reporting bugs:

1. **Search existing issues** first
2. **Use the bug report template**
3. **Include reproduction steps**
4. **Provide environment details**
5. **Add screenshots/logs** if helpful

### Critical Bugs
For security issues or critical bugs:
- Contact maintainers directly
- Do not disclose security vulnerabilities publicly
- Provide detailed reproduction steps

## 🌟 Feature Requests

When requesting features:

1. **Check existing issues** and discussions
2. **Use the feature request template**
3. **Explain the use case** clearly
4. **Consider implementation complexity**
5. **Discuss with maintainers** for major features

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for complex functions
- Update README for new features
- Include examples in documentation

### Database Documentation
- Document schema changes
- Update migration guides
- Include security considerations

## 🔒 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email maintainers directly
- Provide detailed information
- Allow time for fixes before disclosure

### Security Best Practices
- Follow Supabase RLS guidelines
- Validate all user inputs
- Use proper authentication checks
- Implement rate limiting where needed

## 📋 Review Process

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Security considerations addressed
- [ ] Performance impact considered
- [ ] Accessibility guidelines followed

### Review Timeline
- **Small changes**: 1-2 days
- **Medium changes**: 3-5 days
- **Large changes**: 1-2 weeks
- **Critical fixes**: Same day

## 🏆 Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes
- Invited to join the maintainer team (for significant contributions)

## 📞 Getting Help

### Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Documentation**: Check guides and README files

### Response Times
- **Critical issues**: Within 24 hours
- **Bug reports**: Within 3 days
- **Feature requests**: Within 1 week
- **General questions**: Within 5 days

## 📄 License

By contributing to SubMan, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Every contribution makes SubMan better. Whether it's:
- Reporting bugs
- Suggesting features
- Writing documentation
- Submitting code
- Helping other users

Your efforts are appreciated! 🎉

---

**Questions?** Feel free to ask in GitHub Issues or Discussions.
