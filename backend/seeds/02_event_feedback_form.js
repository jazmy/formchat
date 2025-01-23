exports.seed = async function(knex) {
  try {
    console.log('Starting seed...');
    
    // First clear existing data in reverse order of dependencies
    console.log('Clearing existing data...');
    await knex('responses').del();
    await knex('prompts').del();
    await knex('forms').del();

    // Insert form and get the ID
    console.log('Inserting form...');
    const now = new Date().toISOString();
    
    await knex('forms')
      .insert({
        title: 'Event Feedback Survey',
        description: 'Please share your thoughts about our recent tech conference. Your feedback helps us improve future events.',
        active: true,
        created_at: now,
        updated_at: now
      });

    const form = await knex('forms').where({ title: 'Event Feedback Survey' }).first();
    const formId = form.formid;

    console.log('Form ID:', formId);

    // Insert prompts
    console.log('Inserting prompts...');
    const prompts = [
      {
        formid: formId,
        question_text: 'What did you think of the event overall?',
        variable_name: 'overall_experience',
        validation_criteria: 'Provide a detailed response with at least 2-3 specific aspects of the event that influenced your experience.',
        order: 0,
        created_at: now,
        updated_at: now
      },
      {
        formid: formId,
        question_text: 'Which session or workshop was most valuable to you and why?',
        variable_name: 'best_session',
        validation_criteria: 'Name the specific session and explain what made it valuable to you.',
        order: 1,
        created_at: now,
        updated_at: now
      },
      {
        formid: formId,
        question_text: 'How could we improve the event for next year?',
        variable_name: 'improvement_suggestions',
        validation_criteria: 'Provide at least one specific suggestion for improvement.',
        order: 2,
        created_at: now,
        updated_at: now
      }
    ];

    await knex('prompts').insert(prompts);
    console.log('Prompts inserted');

    // Insert sample responses
    console.log('Inserting responses...');
    const responses = [
      {
        formid: formId,
        responses: JSON.stringify({
          answers: [
            {
              variable_name: 'overall_experience',
              response_text: "The event was extremely well-organized and engaging. The mix of technical and soft skill sessions provided great value. I particularly enjoyed the networking opportunities during lunch breaks."
            },
            {
              variable_name: 'best_session',
              response_text: "The 'Advanced Cloud Architecture' workshop was the most valuable. The hands-on exercises with real-world scenarios helped me understand complex concepts that I can apply directly in my work."
            },
            {
              variable_name: 'improvement_suggestions',
              response_text: "Consider adding more intermediate-level sessions. While the beginner and advanced tracks were great, there seemed to be a gap in the middle. Also, having longer breaks between sessions would help with networking."
            }
          ]
        }),
        created_at: '2024-01-15T14:30:00.000Z',
        updated_at: '2024-01-15T14:30:00.000Z'
      },
      {
        formid: formId,
        responses: JSON.stringify({
          answers: [
            {
              variable_name: 'overall_experience',
              response_text: "I found the conference to be informative but somewhat overwhelming. The venue was excellent and the staff were helpful, though the schedule was quite packed with little time to process information between sessions."
            },
            {
              variable_name: 'best_session',
              response_text: "The 'Leadership in Tech' keynote was outstanding. The speaker shared practical experiences and actionable advice about transitioning from developer to team lead, which is exactly what I needed at this point in my career."
            },
            {
              variable_name: 'improvement_suggestions',
              response_text: "Please provide recordings of parallel sessions. There were several times when I wanted to attend two sessions scheduled at the same time. Having access to recordings would solve this problem."
            }
          ]
        }),
        created_at: '2024-01-16T09:15:00.000Z',
        updated_at: '2024-01-16T09:15:00.000Z'
      },
      {
        formid: formId,
        responses: JSON.stringify({
          answers: [
            {
              variable_name: 'overall_experience',
              response_text: "The conference exceeded my expectations. The quality of speakers was outstanding, and the event app made it easy to navigate between sessions. The only downside was the Wi-Fi connectivity issues on the first day."
            },
            {
              variable_name: 'best_session',
              response_text: "The 'AI in Production' workshop stood out for me. The instructor showed us practical implementations and common pitfalls to avoid. The take-home resources and GitHub repository were extremely valuable."
            },
            {
              variable_name: 'improvement_suggestions',
              response_text: "Better Wi-Fi infrastructure is needed. Also, it would be great to have more interactive Q&A sessions after each talk, perhaps using a digital platform for audience questions to avoid the typical rush to the microphone."
            }
          ]
        }),
        created_at: '2024-01-16T16:45:00.000Z',
        updated_at: '2024-01-16T16:45:00.000Z'
      }
    ];

    await knex('responses').insert(responses);
    console.log('Responses inserted');
    console.log('Seed completed successfully');

  } catch (error) {
    console.error('Error in seed:', error);
    throw error;
  }
};