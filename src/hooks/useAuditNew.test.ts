import { renderHook, act } from '@testing-library/react';
import { useAuditNew } from './useAuditNew'; // Assuming useAuditNew.ts is in the same directory
import apiClient from '../api/client_modified'; // Assuming client_modified.ts is in the parent directory

type UseAuditNewReturnType = ReturnType<typeof useAuditNew>;

describe('useAuditNew', () => {
  it('should use generateMockData when submitPageAudit fails', async () => {
    // Arrange    
    apiClient.setShouldSubmitPageAuditFail(true); // Make submitPageAudit fail
    const url = 'https://www.example.com';
    const { result } = renderHook(() => {      
      return useAuditNew();});

    // Act
    await act(async () => {
      await result.current.startAudit(url, "page");
    });

    // Assert
    expect(result.current.status).toBe("completed");
    expect(result.current.results).not.toBeNull();
    // Add more assertions to check the mock data (e.g., specific values in result.current.results) if needed
    // for example, we could check if result.current.results.url is equal to url
    expect(result.current.results?.url).toBe(url);
    apiClient.setShouldSubmitPageAuditFail(false); // Reset the flag
  });
});