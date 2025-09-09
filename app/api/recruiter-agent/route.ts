import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { embedText } from '@/lib/embeddings';
import { AuditLogger } from '@/lib/audit';

export const maxDuration = 30;

// Tool schemas
const saveJobSchema = z.object({
  prompt: z.string(),
  title: z.string(),
  one_liner: z.string(),
  jd_text: z.string(),
  location: z.string().optional(),
  level: z.string().optional(),
  department: z.string().optional(),
  employment_type: z.string().optional(),
});

const vectorQuerySchema = z.object({
  job_id: z.string(),
  top_k: z.number().default(10),
});

const rankCandidatesSchema = z.object({
  job_id: z.string(),
  candidates: z.array(z.object({
    id: z.string(),
    name: z.string(),
    resume_text: z.string(),
    similarity: z.number(),
    years_of_experience: z.number().optional(),
    location: z.string().optional(),
    current_company: z.string().optional(),
    current_position: z.string().optional(),
  })),
});

// Tool implementations
async function saveJobTool(params: z.infer<typeof saveJobSchema>) {
  try {
    // If jd_text is minimal, enhance it with a comprehensive job description
    let enhancedJD = params.jd_text;
    if (params.jd_text.length < 200) {
      enhancedJD = generateComprehensiveJD(params);
    }
    
    // Generate embedding for job description
    const embedding = await embedText(enhancedJD);
    
    // Insert job into database
    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        title: params.title,
        jd_text: enhancedJD,
        jd_embedding: JSON.stringify(embedding),
        location: params.location,
        level: params.level,
        status: 'active',
        department: params.department,
        employment_type: (params.employment_type || 'full-time').toLowerCase(),
        created_by: null, // System generated
      })
      .select()
      .single();

    if (error) throw error;

    // Log audit
    try {
      await AuditLogger.logJobCreation(job.id, 'recruiter-ai', {});
    } catch (auditError) {
      console.warn('Audit logging failed:', auditError);
    }

    const jobData = {
      id: job.id,
      title: job.title,
      one_liner: params.one_liner,
      location: job.location,
      level: job.level,
      department: job.department,
      employment_type: job.employment_type,
      jd_text: enhancedJD,
    };

    return `## ✅ Job Description Created Successfully!

### **${jobData.title}** (${jobData.level})

**📋 Job Summary:**
*${jobData.one_liner}*

**📍 Location:** ${jobData.location}
**🏢 Department:** ${jobData.department}  
**💼 Employment Type:** ${jobData.employment_type}

---

${jobData.jd_text}

---

**Job ID:** \`${jobData.id}\`

JOB_CREATED:${JSON.stringify(jobData)}

## 🤔 What's Next?

The job description has been saved and is ready for candidate matching. Would you like me to:

1. **🔍 Search for candidates** who match this job description
2. **✏️ Edit the job description** if you'd like to make changes
3. **📋 Create another job** for a different role

What would you prefer?`;
  } catch (error) {
    console.error('Error saving job:', error);
    return `Error creating job: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function vectorQueryTool(params: z.infer<typeof vectorQuerySchema>) {
  try {
    // Get the job's embedding
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('jd_embedding_h')
      .eq('id', params.job_id)
      .single();

    if (jobError || !job?.jd_embedding_h) {
      throw new Error('Job not found or missing embedding');
    }

    const embedding = job.jd_embedding_h; // This is already a vector, no need to parse

    // Search for candidates
    const { data: candidates, error } = await supabaseAdmin
      .rpc('search_candidates', {
        query_embedding: embedding,
        match_limit: params.top_k,
        similarity_threshold: 0.1,
      });

    if (error) throw error;

    const candidateList = candidates || [];

    const candidatesWithFullData = candidateList.map((c: any) => ({
      id: c.id,
      name: c.name,
      resume_text: c.resume_text,
      similarity: c.similarity,
      years_of_experience: c.years_of_experience,
      location: c.location,
      current_company: c.current_company,
      current_position: c.current_position,
    }));

    return `## 🔍 Candidate Search Results

**Found ${candidateList.length} potential candidates** for this ${params.job_id} role:

${candidateList.map((c: any, i: number) => 
  `### ${i + 1}. **${c.name}** 
**Similarity Score:** ${Math.round(c.similarity * 100)}% match
**Current Role:** ${c.current_position} at ${c.current_company}
**Location:** 📍 ${c.location}
**Experience:** ${c.years_of_experience} years

---`
).join('\n\n')}

CANDIDATES_FOUND:${JSON.stringify(candidatesWithFullData)}

## 🤔 Next Steps

I've found ${candidateList.length} candidates based on semantic similarity to the job description. 

**Would you like me to:**

1. **📊 Rank & Screen** these candidates using our comprehensive scoring algorithm?
2. **🔍 Expand the search** to find more candidates?
3. **📋 Review individual profiles** before proceeding?

*Note: Ranking will provide detailed scores based on experience match, location fit, skills relevance, and overall compatibility.*

What would you prefer?`;
  } catch (error) {
    console.error('Error in vector query:', error);
    return `Error searching candidates: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function rankCandidatesTool(params: z.infer<typeof rankCandidatesSchema>) {
  try {
    // Get job details for comparison
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('title, level, location, jd_text')
      .eq('id', params.job_id)
      .single();

    if (jobError || !job) throw new Error('Job not found');

    const rankedCandidates = [];

    for (const candidate of params.candidates) {
      // Calculate comprehensive scoring using the same algorithm as recruiter-agent
      let ruleScore = 0;
      let confidenceFactors = [];
      let topSkills = [];

      // 1. Experience Level Scoring (25% weight)
      let experienceScore = 0;
      if (candidate.years_of_experience && job.level) {
        const targetYears = getTargetYearsForLevel(job.level);
        const yearsDiff = Math.abs(candidate.years_of_experience - targetYears);
        experienceScore = Math.max(0, 1 - (yearsDiff / 10));
        confidenceFactors.push(`Experience: ${candidate.years_of_experience} years (target: ${targetYears})`);
      }
      ruleScore += experienceScore * 0.25;

      // 2. Location Match (15% weight)
      let locationScore = 0;
      if (job.location && candidate.location) {
        const jobLoc = job.location.toLowerCase();
        const candLoc = candidate.location.toLowerCase();
        if (jobLoc === candLoc) {
          locationScore = 1.0;
          confidenceFactors.push('Location: Perfect match');
        } else if (jobLoc.includes(candLoc) || candLoc.includes(jobLoc)) {
          locationScore = 0.7;
          confidenceFactors.push('Location: Partial match');
        } else {
          locationScore = 0.2;
          confidenceFactors.push('Location: Different region');
        }
      }
      ruleScore += locationScore * 0.15;

      // 3. Skills & Keyword Matching (35% weight)
      const skillsScore = calculateSkillsMatch(candidate.resume_text, job.jd_text, job.title);
      topSkills = extractTopSkills(candidate.resume_text, job.jd_text);
      confidenceFactors.push(`Skills relevance: ${(skillsScore * 100).toFixed(0)}%`);
      ruleScore += skillsScore * 0.35;

      // 4. Resume Similarity (25% weight)
      const embeddingScore = candidate.similarity;
      confidenceFactors.push(`Resume similarity: ${(embeddingScore * 100).toFixed(0)}%`);
      ruleScore += embeddingScore * 0.25;

      // Final score calculation
      const finalScore = Math.min(1.0, Math.max(0.0, ruleScore));
      const screeningSummary = generateScreeningSummary(candidate, job, finalScore, topSkills);
      const confidence = Math.min(100, Math.max(60, Math.round(finalScore * 85 + 15)));

      // Store results in job_candidate_matches table
      await supabaseAdmin
        .from('job_candidate_matches')
        .upsert({
          job_id: params.job_id,
          candidate_id: candidate.id,
          similarity_score: embeddingScore,
          rule_score: ruleScore,
          final_score: finalScore,
          ranking_explanation: {
            experience_score: experienceScore,
            location_score: locationScore,
            skills_score: skillsScore,
            embedding_score: embeddingScore,
            confidence_factors: confidenceFactors,
          },
          screening_summary: screeningSummary,
          top_skills: topSkills,
          confidence: confidence,
        });

      rankedCandidates.push({
        ...candidate,
        rule_score: ruleScore,
        final_score: finalScore,
        screening_summary: screeningSummary,
        confidence: confidence,
        top_skills: topSkills,
        experienceScore: experienceScore,
        locationScore: locationScore,
        skillsScore: skillsScore,
      });
    }

    rankedCandidates.sort((a, b) => b.final_score - a.final_score);

    return `## 🏆 Candidate Ranking & Screening Complete

**Top ${Math.min(3, rankedCandidates.length)} candidates** ranked by comprehensive scoring:

${rankedCandidates.slice(0, 3).map((c: any, i: number) => {
      const scoreColor = c.final_score >= 0.8 ? '🌟' : c.final_score >= 0.6 ? '🟢' : c.final_score >= 0.4 ? '🟡' : '🔴';
      return `### ${scoreColor} ${i + 1}. **${c.name}**

**Overall Score:** ${Math.round(c.final_score * 100)}/100 | **Confidence:** ${c.confidence}%

**📝 Screening Summary:**
${c.screening_summary}

**💪 Key Skills:** ${c.top_skills.map((s: any) => s.skill).join(', ')}

**📊 Score Breakdown:**
- Experience Match: ${Math.round(c.experienceScore * 25)}/25
- Location Fit: ${Math.round(c.locationScore * 15)}/15  
- Skills Relevance: ${Math.round(c.skillsScore * 35)}/35
- Resume Similarity: ${Math.round(c.similarity * 25)}/25

**📍 Contact:** ${c.current_position} at ${c.current_company}, ${c.location}

---`;
    }).join('\n\n')}

${rankedCandidates.length > 3 ? `\n**+ ${rankedCandidates.length - 3} more candidates** available in the full ranking.\n` : ''}

CANDIDATES_RANKED:${JSON.stringify(rankedCandidates)}

## 🎯 Next Actions

**What would you like to do with these candidates?**

1. **📞 Schedule interviews** with top candidates
2. **📄 Review detailed profiles** of specific candidates  
3. **🔄 Adjust criteria** and search again
4. **📧 Export candidate list** for external review
5. **🔍 Search for more candidates** with different parameters

I'm ready to help with your next step!`;
  } catch (error) {
    console.error('Error ranking candidates:', error);
    return `Error ranking candidates: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Helper function to generate comprehensive job descriptions
function generateComprehensiveJD(params: z.infer<typeof saveJobSchema>): string {
  const { title, level, location, department } = params;
  const experience = level?.toLowerCase().includes('senior') ? '4-6 years' : 
                    level?.toLowerCase().includes('mid') ? '2-4 years' : 
                    level?.toLowerCase().includes('junior') ? '1-2 years' : '3+ years';
  
  return `## About the Role

We are seeking a talented **${title}** to join our ${department || 'Engineering'} team in ${location}. This is an exciting opportunity to work with cutting-edge technologies and contribute to impactful projects.

## Key Responsibilities

- Design, develop, and maintain scalable applications and services
- Collaborate with cross-functional teams to deliver high-quality solutions
- Write clean, efficient, and well-documented code
- Participate in code reviews and technical discussions
- Troubleshoot and debug applications to optimize performance
- Stay up-to-date with industry trends and best practices

## Required Qualifications

- ${experience} of professional software development experience
- Strong programming skills and understanding of software design principles
- Experience with relevant technologies and frameworks
- Excellent problem-solving and analytical skills
- Strong communication and collaboration abilities
- Bachelor's degree in Computer Science, Engineering, or related field

## Preferred Qualifications

- Experience with cloud platforms and DevOps practices
- Knowledge of database design and optimization
- Familiarity with agile development methodologies

## What We Offer

- Competitive salary and benefits package
- Flexible working arrangements
- Professional development opportunities
- Collaborative and inclusive work environment
- Opportunity to work on innovative projects

Join us and be part of a team that values innovation, quality, and continuous learning!`;
}

// Helper functions for scoring
function getTargetYearsForLevel(level: string): number {
  const lvl = level.toLowerCase();
  if (lvl.includes('senior') || lvl.includes('lead')) return 6;
  if (lvl.includes('mid') || lvl.includes('intermediate')) return 3;
  if (lvl.includes('junior') || lvl.includes('entry')) return 1;
  return 3;
}

function calculateSkillsMatch(resumeText: string, jdText: string, jobTitle: string): number {
  const resume = resumeText.toLowerCase();
  const jd = jdText.toLowerCase();
  const title = jobTitle.toLowerCase();

  const techKeywords = [
    'javascript', 'typescript', 'react', 'node', 'python', 'java', 'aws', 
    'docker', 'kubernetes', 'sql', 'mongodb', 'postgres', 'redis', 'graphql',
    'rest', 'api', 'microservices', 'agile', 'scrum', 'git', 'ci/cd'
  ];

  let matchCount = 0;
  let totalRelevant = 0;

  techKeywords.forEach(keyword => {
    if (jd.includes(keyword) || title.includes(keyword)) {
      totalRelevant++;
      if (resume.includes(keyword)) {
        matchCount++;
      }
    }
  });

  return totalRelevant > 0 ? matchCount / totalRelevant : 0.5;
}

function extractTopSkills(resumeText: string, jdText: string): Array<{skill: string, evidence: string}> {
  const resume = resumeText.toLowerCase();
  const jd = jdText.toLowerCase();
  const skills: Array<{skill: string, evidence: string}> = [];

  const skillsMap = {
    'javascript': ['javascript', 'js', 'ecmascript'],
    'typescript': ['typescript', 'ts'],
    'react': ['react', 'reactjs'],
    'node.js': ['node', 'nodejs', 'node.js'],
    'python': ['python', 'django', 'flask'],
    'aws': ['aws', 'amazon web services'],
    'docker': ['docker', 'containerization'],
    'sql': ['sql', 'mysql', 'postgresql'],
  };

  Object.entries(skillsMap).forEach(([skill, variants]) => {
    const hasSkill = variants.some(variant => resume.includes(variant));
    const isRequired = variants.some(variant => jd.includes(variant));
    
    if (hasSkill && isRequired) {
      const evidence = `Mentioned in resume and required for role`;
      skills.push({ skill, evidence });
    }
  });

  return skills.slice(0, 5);
}

function generateScreeningSummary(candidate: any, job: any, score: number, skills: any[]): string {
  const scoreBand = score >= 0.8 ? 'Excellent' : score >= 0.6 ? 'Good' : score >= 0.4 ? 'Fair' : 'Limited';
  const experience = candidate.years_of_experience ? `${candidate.years_of_experience} years` : 'unspecified';
  const topSkillsText = skills.length > 0 ? skills.map(s => s.skill).join(', ') : 'general skills';
  
  return `${scoreBand} match for ${job.title}. Candidate has ${experience} experience with ${topSkillsText}. ${score >= 0.7 ? 'Strong technical background and good role alignment.' : score >= 0.5 ? 'Decent fit with some gaps to assess.' : 'Potential candidate but requires careful evaluation.'}`;
}

// Main system prompt
const SYSTEM_PROMPT = `You are a professional recruiter AI agent that helps hiring managers through a structured, step-by-step recruitment process.

## Your Approach:
**IMPORTANT**: Work through ONE step at a time. Do NOT automatically proceed to the next step unless the recruiter explicitly asks you to continue.

## Available Tools:
1. **saveJob** - Create job descriptions with embeddings
2. **vectorQuery** - Search for candidates using semantic similarity  
3. **rankCandidates** - Score and screen candidates

## Step-by-Step Process:

### Step 1: Job Description Creation
When a user describes a role:
1. Extract and clarify requirements
2. Create a comprehensive job description using **saveJob**
3. Present the job description for review
4. **STOP and ask**: "Would you like me to proceed with searching for candidates?"

### Step 2: Candidate Search (Only when requested)
1. Use **vectorQuery** to find matching candidates
2. Present the candidates found
3. **STOP and ask**: "Would you like me to rank and screen these candidates?"

### Step 3: Candidate Ranking (Only when requested)
1. Use **rankCandidates** to score and screen
2. Present detailed rankings with explanations
3. **STOP and ask**: "What would you like to do next?"

## Key Guidelines:
- **Extract job details carefully**: title, one-liner, full JD text, location, level, department, employment_type
- **Be conversational and professional**
- **Always wait for approval** before moving to the next step
- **Provide clear options** for what the recruiter can do next
- **Show your thinking** but don't overwhelm with details

## Job Description Format:
Create detailed job descriptions with:
- **Title**: Clear, specific job title
- **One-liner**: Compelling summary (1 sentence)
- **JD Text**: Full description with:
  - Company overview
  - Role responsibilities (4-6 points)
  - Required qualifications (4-6 points)
  - Preferred qualifications (2-3 points)
  - Benefits and growth opportunities

Be helpful, thorough, and always wait for the recruiter's input before proceeding!`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Enhance the system prompt with context about the conversation
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const enhancedPrompt = SYSTEM_PROMPT + `\n\n## Current Context:\nUser's latest request: "${lastUserMessage}"\n\nIf this looks like a job requirement, extract the details and create a job description first.`;

    const result = await streamText({
      model: models.normal,
      system: enhancedPrompt,
      messages: convertToModelMessages(messages),
      tools: {
        saveJob: tool({
          description: 'Generate and save a job description with embedding for candidate search',
          inputSchema: saveJobSchema,
          execute: saveJobTool,
        }),
        vectorQuery: tool({
          description: 'Search for candidates using semantic similarity based on job requirements',
          inputSchema: vectorQuerySchema,
          execute: vectorQueryTool,
        }),
        rankCandidates: tool({
          description: 'Score and screen candidates with detailed analysis',
          inputSchema: rankCandidatesSchema,
          execute: rankCandidatesTool,
        }),
      },
      // AI SDK 5.0: using stepCountIs for equivalent behavior
      stopWhen: stepCountIs(5),
      temperature: 0.7,
    });

    // Changed from toTextStreamResponse to toUIMessageStreamResponse for better compatibility
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error in recruiter agent:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}