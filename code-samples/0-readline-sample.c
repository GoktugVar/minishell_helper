#include <stdio.h>
#include <stdlib.h>
#include <readline/readline.h>

int	main(void)
{
	char	*input;

	while (1)
	{
		input = readline("minishell$ ");
		if (input == NULL)
			break ;
		if (*input)
		{
			printf("Komut yakalandı: '%s'\n", input);
		}
		if (strcmp(input, "exit") == 0)
		{
			free(input);
			break ;
		}
		free(input);
	}
	printf("Program sonlandırıldı.\n");
	return (0);
}
