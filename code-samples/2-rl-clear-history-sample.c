#include <stdio.h>
#include <stdlib.h>
#include <readline/readline.h>
#include <readline/history.h>

int	main(void)
{
	char	*input;

	printf("'clear-history' komutu geçmişi temizler.\n");
	while (1)
	{
		input = readline("minishell$ ");
		if (input == NULL)
			break ;
		if (*input)
		{
			if (strcmp(input, "clear-history") == 0)
				rl_clear_history();
			else if (strcmp(input, "exit") == 0)
			{
				free(input);
				break ;
			}
			else
				add_history(input);
		}
		free(input);
	}
	rl_clear_history();
	return (0);
}
