import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AgentPickBadge from './AgentPickBadge';

describe('AgentPickBadge', () => {
  it('renders scores and chosen agent', () => {
    render(<AgentPickBadge scores={{ codex: 0.82, copilot: 0.41, claude: 0.66 }} chosen="codex" />);
    expect(screen.getByText(/Next STB →/)).toBeInTheDocument();
    expect(screen.getByText(/Codex \(0\.82\)/)).toBeInTheDocument();
    expect(screen.getByText(/Copilot \(0\.41\)/)).toBeInTheDocument();
    expect(screen.getByText(/Claude \(0\.66\)/)).toBeInTheDocument();
  });

  it('shows busy status when busy', () => {
    const { container } = render(
      <AgentPickBadge scores={{ codex: 0.82, copilot: 0.41, claude: 0.66 }} chosen="codex" status="busy" />
    );
    expect(container.querySelector('.asvp-badge--busy')).toBeInTheDocument();
  });

  it('shows ok status when completed', () => {
    const { container } = render(
      <AgentPickBadge scores={{ codex: 0.82, copilot: 0.41, claude: 0.66 }} chosen="codex" status="ok" />
    );
    expect(container.querySelector('.asvp-badge--ok')).toBeInTheDocument();
  });

  it('displays custom message when provided', () => {
    render(
      <AgentPickBadge 
        scores={{ codex: 0.82, copilot: 0.41, claude: 0.66 }} 
        chosen="codex" 
        msg="Dispatched → Codex ✓" 
      />
    );
    expect(screen.getByText(/Dispatched → Codex ✓/)).toBeInTheDocument();
  });
});
