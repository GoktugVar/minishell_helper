#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <readline/readline.h>
#include <readline/history.h>

void process_special_command(const char *cmd)
{
    // Özel komut algılandığında, komut satırını değiştir
    if (strcmp(cmd, "date") == 0)
    {
        rl_replace_line("echo $(date)", 1);
        rl_redisplay();
    }
    else if (strcmp(cmd, "pwd") == 0)
    {
        rl_replace_line("echo $(pwd)", 1);
        rl_redisplay();
    }
}

int main(void)
{
    char    *input;
    
    printf("Kısa komutlar: 'date' veya 'pwd' kullanabilirsiniz.\n");
    printf("Bu komutlar otomatik olarak genişletilecektir.\n\n");
    
    while (1)
    {
        input = readline("minishell$ ");
        if (input == NULL)
            break;
            
        if (*input)
        {
            // Özel komutlar için işleme
            process_special_command(input);
            
            // Geçmişe ekle
            add_history(input);
            
            if (strcmp(input, "exit") == 0)
            {
                free(input);
                break;
            }
            
            printf("Çalıştırılan komut: '%s'\n", input);
        }
        
        free(input);
    }
    printf("Program sonlandırıldı.\n");
    return (0);
}