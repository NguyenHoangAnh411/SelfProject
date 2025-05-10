export interface DocumentTemplate {
  title: string;
  content: string;
  description: string;
  category: 'legal' | 'business' | 'policy';
}

export const documentTemplates: Record<string, DocumentTemplate> = {
  legal: {
    title: 'Legal Document Template',
    description: 'Standard template for legal agreements and contracts',
    category: 'legal',
    content: `
      <div class="legal-document">
        <h1>LEGAL DOCUMENT</h1>
        <div class="parties">
          <h2>PARTIES</h2>
          <p>This agreement is made between:</p>
          <p>Party A: [Name]</p>
          <p>Party B: [Name]</p>
        </div>
        <div class="terms">
          <h2>TERMS AND CONDITIONS</h2>
          <p>1. [Term 1]</p>
          <p>2. [Term 2]</p>
          <p>3. [Term 3]</p>
        </div>
        <div class="signatures">
          <h2>SIGNATURES</h2>
          <p>Party A: _________________</p>
          <p>Party B: _________________</p>
          <p>Date: _________________</p>
        </div>
      </div>
    `
  },
  contract: {
    title: 'Contract Template',
    description: 'Template for business contracts and agreements',
    category: 'business',
    content: `
      <div class="contract">
        <h1>CONTRACT AGREEMENT</h1>
        <div class="parties">
          <h2>CONTRACTING PARTIES</h2>
          <p>This contract is entered into by and between:</p>
          <p>First Party: [Name]</p>
          <p>Second Party: [Name]</p>
        </div>
        <div class="scope">
          <h2>SCOPE OF WORK</h2>
          <p>[Description of work/services]</p>
        </div>
        <div class="payment">
          <h2>PAYMENT TERMS</h2>
          <p>Amount: [Amount]</p>
          <p>Payment Schedule: [Schedule]</p>
        </div>
        <div class="signatures">
          <h2>SIGNATURES</h2>
          <p>First Party: _________________</p>
          <p>Second Party: _________________</p>
          <p>Date: _________________</p>
        </div>
      </div>
    `
  },
  policy: {
    title: 'Policy Template',
    description: 'Template for company policies and procedures',
    category: 'policy',
    content: `
      <div class="policy">
        <h1>POLICY DOCUMENT</h1>
        <div class="purpose">
          <h2>PURPOSE</h2>
          <p>[Policy purpose and objectives]</p>
        </div>
        <div class="scope">
          <h2>SCOPE</h2>
          <p>[Who this policy applies to]</p>
        </div>
        <div class="procedures">
          <h2>PROCEDURES</h2>
          <p>1. [Procedure 1]</p>
          <p>2. [Procedure 2]</p>
          <p>3. [Procedure 3]</p>
        </div>
        <div class="compliance">
          <h2>COMPLIANCE</h2>
          <p>[Compliance requirements and monitoring]</p>
        </div>
      </div>
    `
  }
}; 