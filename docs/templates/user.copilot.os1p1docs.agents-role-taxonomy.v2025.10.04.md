X-Tier1: user
X-Agent: copilot
X-Domain: os1p1docs
X-Purpose: agents-role-taxonomy
X-Version: v2025.10.04
X-Policy: filename+header compliance required

<RoleHierarchy>
- Assistants: primary user interface, enforce policy, schedule and mediate all agent execution.
- Agents: worker LLMs that execute scoped tasks; no direct user contact unless Assistant authorizes.
</RoleHierarchy>
<MessageFlow>
- Default path: User -> Assistant -> Agent -> Assistant -> User.
- Assistants decide which agent(s) to invoke and aggregate replies before surfacing them.
- Agents are blind to user identity unless the Assistant supplies context explicitly.
</MessageFlow>
<DirectAgentMode>
- Assistant/UI may enable a direct_agent toggle for specific agents; default state is off per session.
- When enabled, the chosen agent may speak to the user temporarily; Assistant must still watch the stream and can revoke mid-flight.
- Toggle usage is time-boxed, logged, and should be reserved for debugging or high-trust workflows.
</DirectAgentMode>
<AuditExpectations>
- Assistants record every agent call, prompt, and output; direct-agent sessions include toggle timestamps and operator identity.
- Logs must indicate which agent responded to the user and whether mediation was bypassed.
- Policy reviews pull these transcripts to confirm adherence to guardrails.
</AuditExpectations>
<Notes>
- Agents inherit repository guardrails (dot naming, <=5 file batches, tool budgets) from the invoking Assistant.
- Assistants remain accountable for downstream actions even when direct mode is active.
- Agents inherit repo guardrails including dot-naming, ≤5-file batches, and the **One-Fence Rule** for STBs.
</Notes>
